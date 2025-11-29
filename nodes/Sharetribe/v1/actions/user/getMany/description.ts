import type { UserProperties } from '../../Interfaces';
import { createRelationshipFields, createResultModeFields } from '../../../GenericFunctions';
import { UI_OPERATIONS, UI_RESOURCES } from '../../../constants';
import { createUserFilterOptions } from '../filters';
import { createUserSortOptions } from '../sorts';

export const getManyDescription: UserProperties = [
	...createRelationshipFields(UI_OPERATIONS.GET_MANY, UI_RESOURCES.USER),
	...createResultModeFields(UI_RESOURCES.USER, UI_OPERATIONS.GET_MANY, 'user'),
	createUserFilterOptions(),
	createUserSortOptions(),
];
