import type { INodeProperties } from 'n8n-workflow';

export const nodeProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Update',
				value: 'update',
				description: 'Update documents',
				action: 'Update documents',
			},
		],
		default: 'update',
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
		displayName: 'Query (JSON Format)',
		name: 'query',
		type: 'json',
		typeOptions: {
			rows: 5,
		},
		displayOptions: {
			show: {
				operation: ['update'],
			},
		},
		default: '{}',
		placeholder: '{ "birth": { "$gt": "1950-01-01" } }',
		required: true,
		description: 'MongoDB Find query',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'json',
		displayOptions: {
			show: {
				operation: ['update'],
			},
		},
		default: '{}',
		placeholder: '{ "birth": {{ $json.variable }} }',
		description: 'Mapping fields to update',
	}
];
