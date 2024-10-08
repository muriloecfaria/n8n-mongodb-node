import type { INodeProperties } from 'n8n-workflow';

export const nodeProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Delete One',
				value: 'deleteOne',
				description: 'Delete a document',
				action: 'Delete a document'
			},
			{
				name: 'Find',
				value: 'find',
				description: 'Find documents',
				action: 'Find documents'
			},
			{
				name: 'Insert',
				value: 'insert',
				description: 'Insert a document',
				action: 'Insert a document'
			},
			{
				name: 'Replace One',
				value: 'replaceOne',
				description: 'Replace a document',
				action: 'Replace a document'
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update documents',
				action: 'Update documents'
			}
		],
		default: 'find'
	},
	{
		displayName: 'Collection',
		name: 'collection',
		type: 'string',
		required: true,
		default: '',
		description: 'MongoDB Collection',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		displayOptions: {
			show: {
				operation: ['find'],
			},
		},
		default: {},
		placeholder: 'Add options',
		description: 'Add query options',
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				// eslint-disable-next-line n8n-nodes-base/node-param-description-wrong-for-limit
				description:
					'Use limit to specify the maximum number of documents or 0 for unlimited documents',
			},
			{
				displayName: 'Skip',
				name: 'skip',
				type: 'number',
				default: 0,
				description: 'The number of documents to skip in the results set',
			},
			{
				displayName: 'Sort (JSON Format)',
				name: 'sort',
				type: 'json',
				typeOptions: {
					rows: 2,
				},
				default: '{}',
				placeholder: '{ "field": -1 }',
				description: 'A JSON that defines the sort order of the result set',
			},
		],
	},
	{
		displayName: 'Query (JSON Format)',
		name: 'query',
		type: 'json',
		typeOptions: {
			rows: 5,
		},
		displayOptions: {
			show: {
				operation: ['update', 'find', 'replaceOne', 'deleteOne']
			},
		},
		default: '{}',
		placeholder: '{ "birth": { "$gt": "1950-01-01" } }',
		required: true,
		description: 'MongoDB Find query'
	},
	{
		displayName: 'Document (JSON Format)',
		name: 'document',
		type: 'json',
		displayOptions: {
			show: {
				operation: ['insert', 'replaceOne'],
			},
		},
		default: '{}',
		placeholder: '{ "field": "value" }',
		description: 'The document data to insert or replace',
	},
	{
		displayName: 'Update',
		name: 'update',
		type: 'json',
		displayOptions: {
			show: {
				operation: ['update']
			},
		},
		default: '{}',
		placeholder: '{ "$set": {"birth": {{ $json.variable }} }}',
		description: 'The update operations to be applied to the document(s)'
	},
	{
		displayName: 'Update Options',
		name: 'updateOptions',
		type: 'json',
		displayOptions: {
			show: {
				operation: ['update']
			},
		},
		default: '{}',
		placeholder: '{ "$set": {"birth": {{ $json.variable }} }}',
		description: 'The update options operations to be applied to the document(s)'
	}
];
