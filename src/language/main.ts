import { startLanguageServer } from 'langium';
import { NodeFileSystem } from 'langium/node';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node.js';
import { createAugmenterServices } from './langbite-augmentation-dsl-module.js';

// Create a connection to the client
const connection = createConnection(ProposedFeatures.all);

// Inject the shared services and language-specific services
const { shared } = createAugmenterServices({ connection, ...NodeFileSystem });

// Start the language server with the shared services
startLanguageServer(shared);
