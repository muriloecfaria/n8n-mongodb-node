import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';

import { connectMongoClient, validateAndResolveMongoCredentials } from './GenericFunctions';
import { nodeProperties } from './MongoDbProperties';
import { Document, Sort } from 'mongodb';
import { generatePairedItemData } from '../../utils/utilities';

export class MongoDbOperations implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Mongo Db Operations',
		name: 'mongoDbOperations',
		icon: 'file:mongodb.svg',
		group: ['input'],
		version: 1,
		description: 'MongoDB Operations',
		defaults: {
			name: 'MongoDB Operations',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'mongoDb',
				required: true,
				testedBy: 'mongoDbCredentialTest',
			},
		],
		properties: nodeProperties,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let responseData: IDataObject | IDataObject[] = [];

		const credentials = await this.getCredentials('mongoDb');
		const { database, connectionString } = validateAndResolveMongoCredentials(this, credentials);
		const client = await connectMongoClient(connectionString, credentials);
		const items = this.getInputData();

		try {
			const mdb = client.db(database);
			const operation = this.getNodeParameter('operation', 0);

			switch (operation) {
				case 'update':
					const queryParameter = JSON.parse(
						this.getNodeParameter('query', 0) as string,
					) as IDataObject;

					const fields = JSON.parse(this.getNodeParameter('fields', 0) as string) as IDataObject;

					await mdb
						.collection(this.getNodeParameter('collection', 0) as string)
						.updateOne(queryParameter as unknown as Document, { $set: fields });

					responseData = [...items];

					break;
				case "find":


				try {
					const queryParameter = JSON.parse(
						this.getNodeParameter('query', 0) as string,
					) as IDataObject;

					let query = mdb
						.collection(this.getNodeParameter('collection', 0) as string)
						.find(queryParameter as unknown as Document);

					const options = this.getNodeParameter('options', 0);
					const limit = options.limit as number;
					const skip = options.skip as number;
					const sort = options.sort && (JSON.parse(options.sort as string) as Sort);
					if (skip > 0) {
						query = query.skip(skip);
					}
					if (limit > 0) {
						query = query.limit(limit);
					}
					if (sort && Object.keys(sort).length !== 0 && sort.constructor === Object) {
						query = query.sort(sort);
					}
					const queryResult = await query.toArray();

					responseData = queryResult && queryResult.length
						? queryResult
						: {};

				} catch (error) {
					if (this.continueOnFail()) {
						responseData = [{ error: (error as JsonObject).message }];
					} else {
						throw error;
					}
				}

					break;
			}
		} catch (error) {
			if (this.continueOnFail()) {
				responseData = [{ error: (error as JsonObject).message }];
			} else {
				throw error;
			}
		} finally {
			await client.close();
		}

		const itemData = generatePairedItemData(items.length);

		const returnItems = this.helpers.constructExecutionMetaData(
			this.helpers.returnJsonArray(responseData),
			{ itemData },
		);

		return [returnItems];
	}
}
