import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	IHttpRequestOptions,
	IBinaryData,
	JsonObject,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { handleSharetribeError } from '../../../transport';

const DEFAULT_FILENAME = 'image';

export async function upload(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const source = this.getNodeParameter('imageSource', index) as IDataObject;
	const mode = source?.mode;
	const enteredUrl = source?.value?.toString() ?? '';
	const binaryPropertyName = source?.value?.toString() ?? '';
	const url = URL.parse(enteredUrl);
	const qs: IDataObject = { expand: true };

	let binaryMetadata: IBinaryData;
	let binaryBuffer: Buffer;
	let fileName = DEFAULT_FILENAME;
	let contentType = 'application/octet-stream';

	if (mode === 'imageUrl') {
		if (!url) {
			throw new NodeOperationError(this.getNode(), {
				message: 'Invalid URL',
			});
		}
		this.logger.info(`Fetching image from URL: ${url}`);

		const res = await this.helpers.httpRequest({
			method: 'GET',
			url: url.toString(),
			returnFullResponse: true,
			encoding: 'arraybuffer',
		});

		binaryBuffer = res.body as Buffer;

		const headers = res.headers ?? {};

		const contentDisposition: string = headers['content-disposition'];
		if (contentDisposition && contentDisposition.includes('filename')) {
			const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n\r]+)/i);
			if (filenameMatch && filenameMatch[1]) {
				fileName = decodeURIComponent(filenameMatch[1]);
			}
		}

		const ct = (headers['content-type'] || headers['Content-Type']) as string | undefined;

		if (ct) {
			contentType = ct;
		}
	} else if (mode === 'binaryPropertyName') {
		binaryMetadata = this.helpers.assertBinaryData(index, binaryPropertyName);

		binaryBuffer = await this.helpers.getBinaryDataBuffer(index, binaryPropertyName);

		contentType = binaryMetadata.mimeType || contentType;
		fileName = binaryMetadata.fileName || DEFAULT_FILENAME;
	} else {
		throw new NodeOperationError(this.getNode(), `Invalid 'source'.`);
	}

	const boundary = `----n8nFormBoundary${Date.now()}`;
	const preamble =
		`--${boundary}\r\n` +
		`Content-Disposition: form-data; name="image"; filename="${fileName}"\r\n` +
		`Content-Type: ${contentType}\r\n\r\n`;
	const closing = `\r\n--${boundary}--\r\n`;

	const bodyBuffer = Buffer.concat([
		Buffer.from(preamble, 'utf8'),
		binaryBuffer,
		Buffer.from(closing, 'utf8'),
	]);

	this.logger.info(`Uploading image with content type: ${contentType} and filename: ${fileName}`);

	const credentials = await this.getCredentials('sharetribeOAuth2Api');
	const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${baseUrl}/v1/integration_api/images/upload`,
		qs,
		headers: {
			'Content-Type': `multipart/form-data; boundary=${boundary}`,
			'Content-Length': bodyBuffer.length,
		},
		body: bodyBuffer,
	};

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'sharetribeOAuth2Api',
			options,
		);

		this.logger.info(`Image upload API response: ${JSON.stringify(response, null, 2)}`);

		return this.helpers.returnJsonArray(response?.data);
	} catch (error) {
		return handleSharetribeError.call(this, error as JsonObject, 'images/upload');
	}
}
