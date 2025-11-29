import type { ImageProperties } from '../../Interfaces';
import { PROPERTY_NAMES } from '../../../GenericFunctions';
import { UI_RESOURCES, UI_OPERATIONS } from '../../../constants';

export const imageUploadDescription: ImageProperties = [
	{
		displayName: 'Source',
		name: 'imageSource',
		type: 'resourceLocator',
		default: { mode: 'imageUrl', value: '' },
		description: 'Where to read the image from',
		modes: [
			{
				displayName: 'File',
				name: 'binaryPropertyName',
				type: 'string',
				hint: 'Enter the name of the incoming field containing the image file data you want to upload',
				placeholder: 'data',
			},
			{
				displayName: 'URL',
				name: 'imageUrl',
				type: 'string',
				hint: 'Enter a URL to an image',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: `^(https?:\\/\\/)?(www\\.)?([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(\\/[^\\s]*)?$`,
							errorMessage: 'Invalid URL',
						},
					},
				],
				placeholder: 'https://example.com/image.png',
			},
		],
		displayOptions: {
			show: {
				[PROPERTY_NAMES.RESOURCE]: [UI_RESOURCES.IMAGE],
				[PROPERTY_NAMES.OPERATION]: [UI_OPERATIONS.UPLOAD],
			},
		},
	},
];
