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
				case 'update': {

					for (let i = 0; i < items.length; i++) {

						const queryParameter = JSON.parse(
							this.getNodeParameter('query', i) as string,
						) as IDataObject;

						const updateParameter = JSON.parse(this.getNodeParameter('update', i) as string) as IDataObject;
						const updateOptionsParameter = JSON.parse(this.getNodeParameter('updateOptions', i) as string) as IDataObject;

						await mdb
							.collection(this.getNodeParameter('collection', i) as string)
							.updateOne(queryParameter as unknown as Document, updateParameter as unknown as Document, updateOptionsParameter as unknown as Document);
					}

					responseData = [...items];
					break;
				}
				case 'find': {
					try {

						const documents: IDataObject[] = [];

						for (let i = 0; i < items.length; i++) {

							const queryParameter = JSON.parse(
								this.getNodeParameter('query', i) as string,
							) as IDataObject;

							let query = mdb
								.collection(this.getNodeParameter('collection', i) as string)
								.find(queryParameter as unknown as Document);

							const options = this.getNodeParameter('options', i);
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

							if (queryResult && queryResult.length) {
								for (const entry of queryResult) {
									documents.push(entry);
								}
							}
							
						}

						responseData = documents && documents.length
							? documents
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
				case 'aggregate': {
					try {

						const documents: IDataObject[] = [];

						for (let i = 0; i < items.length; i++) {

							const queryParameter = JSON.parse(
								this.getNodeParameter('query', i) as string,
							) as IDataObject;

							let query = mdb
								.collection(this.getNodeParameter('collection', i) as string)
								.aggregate(queryParameter as unknown as Document[]);

							const options = this.getNodeParameter('options', i);
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

							if (queryResult && queryResult.length) {
								for (const entry of queryResult) {
									documents.push(entry);
								}
							}
						}

						responseData = documents && documents.length
							? documents
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
				case 'insert': {

					const documents: IDataObject[] = [];

					for (let i = 0; i < items.length; i++) {
						const insertData = JSON.parse(this.getNodeParameter('document', i) as string) as IDataObject;
						documents.push(insertData);
					}
				
					await mdb
						.collection(this.getNodeParameter('collection', 0) as string)
						.insertMany(documents as unknown as Document[]);

					responseData = documents;
					break;
				}
				case 'replaceOne': {

					const documents: IDataObject[] = [];

					for (let i = 0; i < items.length; i++) {

						const queryParameter = JSON.parse(
							this.getNodeParameter('query', i) as string,
						) as IDataObject;

						const replaceData = JSON.parse(this.getNodeParameter('document', i) as string) as IDataObject;

						await mdb
							.collection(this.getNodeParameter('collection', i) as string)
							.replaceOne(queryParameter as unknown as Document, replaceData as unknown as Document);

						documents.push(replaceData);
					}	

					responseData = documents;
					break;
				}
				case 'deleteOne': {

					for (let i = 0; i < items.length; i++) {

						const queryParameter = JSON.parse(
							this.getNodeParameter('query', i) as string,
						) as IDataObject;

						await mdb
							.collection(this.getNodeParameter('collection', i) as string)
							.deleteOne(queryParameter as unknown as Document);

					}

					responseData = [...items];
					break;
				}
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
