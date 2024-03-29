console.log('*** TableActions');

const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require("@octokit/graphql");
const _ = require('lodash');

class TableActions {

    async removeItemFromTable(octokit, context, tableNumber) {
        const { itemType, itemNumber, itemId } = context;

        if (!tableNumber) {
            throw new Error(`tableNumber is required.`);
        }

        if (!itemId) {
            throw new Error(`itemId is required.`);
        }

        const tableId = this.findTableId(octokit, context, tableNumber);
        if (!tableId) {
            throw new Error(`Error removing item from table: tableNumber ${tableNumber} not found`);
        }

        console.log(`Removing ${itemType} number ${itemNumber}, ID ${itemId} from table [${tableNumber}], owner "${context.owner}"`);
        await this.removeItem(octokit, itemId, tableId);
    }

    async removeItem(octokit, itemId, tableId) {
        console.log('TODO: Remove item');
    }

    async addItemToTable(octokit, context, tableNumber) {
        const { itemType, itemNumber, itemId } = context;

        if (!tableNumber) {
            throw new Error(`tableNumber is required.`);
        }

        if (!itemId) {
            throw new Error(`itemId is required.`);
        }

        const tableId = this.findTableId(octokit, context, tableNumber);
        if (!tableId) {
            throw new Error(`Error adding item to table: tableNumber ${tableNumber} not found`);
        }

        console.log(`Creating a new item for ${itemType} number ${itemNumber}, ID ${itemId} in table [${tableNumber}], owner "${context.owner}"`);
        await this.createItem(octokit, itemId, tableId);
    }

    async findTableId(octokit, context, tableNumber) {
        try {
            const query = `{
                organization(login: "${context.owner}") {
                    projectNext(number: ${tableNumber}) {
                        id
                    }
                }
            }`;
            console.log(`Query for table ID:\n${query}`);
            const response = await octokit(query);
            console.log(`Response from query for table ID:\n${JSON.stringify(response, null, 2)}`);
            return _.get(response, 'organization.projectNext.id');
        } catch (error) {
            throw new Error(`Error querying table ID for table number ${tableNumber}: ${error.message}`);
        }
    }

    async createItem(octokit, itemId, tableId) {
        try {
            const mutation = `
                mutation {
                    addProjectNextItem(input: {projectId: "${tableId}" contentId: "${itemId}"}) {
                        projectNextItem {
                            id
                        }
                    }
                }`;
            console.log(`Create item mutation: ${mutation}`);
            const response = await octokit(mutation); // Octokit will throw an error if GraphQL returns any error messages
            console.log(`Create item response:\n${JSON.stringify(response)}`);
        } catch (error) {
            throw new Error(`Error creating item for item ID [${itemId}] in table ${tableId}: ${error.message}`);
        }
    }

    // async findProjectCardId(octokit, projectNumber, context) {
    //     const { itemQuery, projectCardsPath, itemType, itemNumber } = context;
    //     try {
    //         const query = `{
    //             ${this.scopedProjectQuery("repo", context)} {
    //                 ${itemQuery} {
    //                     projectCards {
    //                         edges {
    //                             node {
    //                                 project {
    //                                     number
    //                                 },
    //                                 id
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }`;

    //         console.log(`Query for project cards:\n${query}`);
    //         const response = await octokit(query);
    //         console.log(`Response from query for project cards:\n${JSON.stringify(response, null, 2)}`);
    //         const projectCards = _.get(response, projectCardsPath);
    //         let cardId = null;
    //         if (projectCards) {
    //             const matchingCard = _.find(projectCards, function(card) {
    //                 return (projectNumber == _.get(card, 'node.project.number'));
    //             });

    //             if (matchingCard) {
    //                 cardId = _.get(matchingCard, 'node.id');
    //             }
    //         }
    //         return cardId;
    //     } catch (error) {
    //         throw new Error(`Error querying project card for ${itemType} number ${itemNumber}: ${error.message}`);
    //     }
    // }

    // async findColumnIdForColumnName(octokit, projectScope, projectNumber, columnName, context) {
    //     try {
    //         const query = `{
    //             ${this.scopedProjectQuery(projectScope, context)} {
    //                 project(number: ${projectNumber}) {
    //                     columns(first: 50) {
    //                         nodes {
    //                             name,
    //                             id
    //                         }
    //                     }
    //                 }
    //             }
    //         }`;

    //         console.log(`Query for project columns:\n ${query}`)
    //         const response = await octokit(query);
    //         console.log(`Response for project columns query:\n ${JSON.stringify(response, null, 2)}`);
    //         const nodePath = this.scopedProjectColumnsPath(projectScope);
    //         const columns = _.get(response, nodePath);
    //         console.log(`Columns returned at nodePath '${nodePath}': ${JSON.stringify(columns, null, 2)}`);
    //         if (columns) {
    //             console.log(`Searching for column named '${columnName}'`);
    //             const targetColumn = _.find(columns, function(column) {
    //                 return (columnName == _.get(column, 'name'));
    //             });
    //             if (targetColumn) {
    //                 console.log(`Found targetColumn: ${JSON.stringify(targetColumn)}`);
    //                 const targetColumnId =  _.get(targetColumn, 'id');
    //                 console.log(`Found target column ID: ${targetColumnId}`);
    //                 return targetColumnId;
    //             }
    //         }
    //         console.log(`Column not found for columName ${columnName}`);
    //         return null;
    //     } catch (error) {
    //         throw new Error(`Error finding column ID for column name ${columnName}: ${error.message}`);
    //     }
    // }

    // async createCard(octokit, projectColumnId, contentId) {
    //     try {
    //         const mutation = `
    //             mutation {
    //                 addProjectCard(input: { projectColumnId: "${projectColumnId}", contentId: "${contentId}" }) {
    //                     cardEdge {
    //                         node {
    //                             id
    //                         }
    //                     }
    //                 }
    //             }`;
    //         console.log(`Create card mutation: ${mutation}`);
    //         const response = await octokit(mutation); // Octokit will throw an error if GraphQL returns any error messages
    //         console.log(`Create card response:\n${JSON.stringify(response)}`);
    //     } catch (error) {
    //         throw new Error(`Error creating card with content ID [${contentId}] in project column [${projectColumnId}]: ${error.message}`);
    //     }
    // }

    // // GraphQL query segment to allow searching for projects belonging to an organization, user, or repository.
    // scopedProjectQuery(projectScope, context) {
    //     switch(projectScope) {
    //         case 'org':
    //             return `organization(login: "${context.owner}")`;
    //         case 'user':
    //             return `user(login: "${context.owner}")`;
    //         case 'repo':
    //             return `repository(owner: "${context.owner}", name: "${context.repo}")`;
    //         default:
    //             throw new Error(`Invalid projectScope ${projectScope}. Expected: org, user, or repo`);
    //     }
    // }

    // // For extracting columns data from a project columns GraphQL query
    // scopedProjectColumnsPath(projectScope) {
    //     switch(projectScope) {
    //         case 'org':
    //             return 'organization.project.columns.nodes';
    //         case 'user':
    //             return 'user.project.columns.nodes';
    //         case 'repo':
    //             return 'repository.project.columns.nodes';
    //         default:
    //             throw new Error(`Invalid projectScope ${projectScope}. Expected: org, user, or repo`);
    //     }
    // }

    // // Label removed; Find any associated project card and delete it.
    // async handleUnlabeled(octokit, projectNumber, labelToMatch, context) {
    //     if (context.label == labelToMatch) {
    //         const { itemType, itemNumber } = context;

    //         if (!projectNumber) {
    //             throw new Error(`projectNumber is required.`);
    //         }

    //         const projectCards = await this.findProjectCardsForPayloadItem(octokit, context);
    //         if (!projectCards) {
    //             console.log(`No project cards found for ${itemType} number ${itemNumber}`);
    //             return;
    //         }

    //         const cardToRemove = _.find(projectCards, function(card) {
    //             return (projectNumber == _.get(card, 'node.project.number'));
    //         });
    //         if (!cardToRemove) {
    //             console.log(`No card found in project ${projectNumber} for the given ${itemType}`);
    //             return;
    //         }

    //         const cardId = _.get(cardToRemove, 'node.id');
    //         console.log(`Removing card [${cardId}] for ${itemType} number ${itemNumber} from project ${projectNumber}`);
    //         await this.removeCard(octokit, cardId);
    //     }
    // }

    // async findProjectCardsForPayloadItem(octokit, context) {
    //     const { owner, repo, projectCardsPath, itemQuery, itemType, itemNumber } = context;
    //     try {
    //         const query = `{
    //             repository(owner: "${owner}", name: "${repo}") {
    //                 ${itemQuery} {
    //                     projectCards {
    //                         edges {
    //                             node {
    //                                 project {
    //                                     number
    //                                 },
    //                                 id
    //                             }
    //                         }
    //                     }
    //                 }
    //             }
    //         }`;
    //         console.log(`Query for project cards:\n${query}`);
    //         const response = await octokit(query); // Octokit will throw an error if GraphQL returns any error messages
    //         console.log(`Response to query for project cards:\n${JSON.stringify(response)}`);
    //         return _.get(response, projectCardsPath);
    //     } catch (error) {
    //         throw new Error(`Error finding project cards for ${itemType} number ${itemNumber}: ${error.message}`);
    //     }
    // }

    // async removeCard(octokit, cardId) {
    //     try {
    //         const mutation = `mutation {
    //             deleteProjectCard(input: {cardId: "${cardId}"}) {
    //                 deletedCardId
    //             }
    //         }`;
    //         console.log(`Remove card mutation:\n${mutation}`);
    //         const response = await octokit(mutation); // Octokit will throw an error if GraphQL returns any error messages
    //         console.log(`Remove card response:\n${JSON.stringify(response)}`);
    //     } catch (error) {
    //         throw new Error(`Error removing card ${cardId}`);
    //     }
    // }

    normalizedGithubContext(githubContext) {
        const context = {
            owner: githubContext.payload.repository.owner.login,
            repo: githubContext.payload.repository.name,
            label: githubContext.payload.label.name,
            action: githubContext.payload.action,
        }
        if (githubContext.eventName == "issues") {
            context.itemType = 'Issue';
            context.itemNumber = githubContext.payload.issue.number;
            context.itemId = githubContext.payload.issue.node_id;
        }
        else if (githubContext.eventName == "pull_request") {
            context.itemType = 'Pull request';
            context.itemNumber = githubContext.payload.pull_request.number;
            context.itemId = githubContext.payload.pull_request.node_id;
        }
        return context;
    }

    getConfigs() {
        return {
            syncWithTableConfigs: JSON.parse(core.getInput('sync-with-table')) || [],
            syncFieldsConfig: JSON.parse(core.getInput('sync-fields')) || [],
        }
    }

    async run() {
        console.log('Running');
        const ghToken = core.getInput('ghToken');
        const octokit = graphql.defaults({
            headers: {
                authorization: `Bearer ${ghToken}`
            }
        });

        try {
            console.log('Fetching configs');
            const { syncWithTableConfigs, syncFieldsConfig } = this.getConfigs();
            console.dir(syncWithTableConfigs);
            const context = this.normalizedGithubContext(github.context);
            if (context.action === "labeled") {
                for (const syncWithTableConfig of syncWithTableConfigs) {
                    if (context.label === syncWithTableConfig.label) {
                        await this.addItemToTable(octokit, context, syncWithTableConfig.tableNumber);
                    }
                };

            } else if (context.action == "unlabeled") {
                for (const syncWithTableConfig of syncWithTableConfigs) {
                    if (context.label === syncWithTableConfig.label) {
                        await this.removeItemFromTable(octokit, context, syncWithTableConfig.tableNumber);
                    }
                };
            }
        } catch (error) {
            const ghContext = JSON.stringify(github.context, undefined, 2);
            core.setFailed(`Action failed with error: ${error.message}\n Event context:\n\n${ghContext}`);
        }
    }
}

module.exports = TableActions;
