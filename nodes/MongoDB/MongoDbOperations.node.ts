import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';

import {
	connectMongoClient,
	validateAndResolveMongoCredentials,
} from './GenericFunctions';
import { nodeProperties } from './MongoDbProperties';
import { Document } from 'mongodb';
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
