let addon: any;
const os = require("os");
import { logger } from "../logging/logger";

if(os.platform() === "win32") {
    logger.info("Loading Windows NAPI addon...");
    try {
        addon = require("../../out/Windows/cblite-js.node");
    } catch(e) {
        logger.error("Failed to load...");
        logger.error(e);
        throw e;
    }
} else if(os.platform() === "darwin") {
    logger.info("Loading macOS NAPI addon...");
    try {
        addon = require("../../out/Darwin/cblite-js.node");
    } catch(e) {
        logger.error("Failed to load...");
        logger.error(e);
        throw e;
    }
} else {
    logger.info("Loading Linux NAPI addon...");
    try {
        addon = require("../../out/Linux/cblite-js.node");
    } catch(e) {
        logger.error("Failed to load...");
        logger.error(e);
        throw e;
    }
}

export enum CBLErrorDomain {
    LITE_CORE = 1,
    POSIX,
    SQLITE,
    FLEECE,
    NETWORK,
    WEB_SOCKET
}

export enum LiteCoreErrorCode {
    ASSERTION_FAILED = 1,
    UNIMPLEMENTED,
    UNSUPPORTED_ENCRYPTION,
    BAD_REVISION_ID,
    CORRUPT_REVISION_DATA,
    NOT_OPEN,
    NOT_FOUND,
    CONFLICT,
    INVALID_PARAMETER,
    UNEXPECTED_ERROR,
    CANT_OPEN_FILE,
    IO_ERROR,
    MEMORY_ERROR,
    NOT_WRITEABLE,
    CORRUPT_DATA,
    BUSY,
    NOT_IN_TRANSACTION,
    TRANSACTION_NOT_CLOSED,
    UNSUPPORTED,
    NOT_A_DATABASE_FILE,
    WRONG_FORMAT,
    CRYPTO,
    INVALID_QUERY,
    MISSING_INDEX,
    INVALID_QUERY_PARAM,
    REMOTE_ERROR,
    DATABASE_TOO_OLD,
    DATABASE_TOO_NEW,
    BAD_DOC_ID,
    CANT_UPGRADE_DATABASE
}

export enum EncryptionAlgorithm {
    NONE,
    AES256
}

export interface EncryptionKey {
    algorithm: EncryptionAlgorithm
    bytes: ArrayBuffer | Uint8Array
}

export class EncryptionKeyMethods {
    public static createFromPassword(password: string) : EncryptionKey {
        return addon.EncryptionKey.createFromPassword(password);
    }
}

export var EncryptionKey: {
    new(): EncryptionKey
    new(algo: EncryptionAlgorithm, bytes: ArrayBuffer | Uint8Array): EncryptionKey
} = addon.EncryptionKey;

export interface DatabaseConfiguration {
    directory: string
    encryptionKey: EncryptionKey
}

export var DatabaseConfiguration: {
    new(): DatabaseConfiguration
} = addon.DatabaseConfiguration;

export class Database {
    private _inner: any;

    public static exists(name: string, inDirectory: string): boolean {
        return addon.Database.exists(name, inDirectory);
    }

    public static copyDatabase(fromPath: string, toName: string,
        config?: DatabaseConfiguration): void {
        if(config) {
            addon.Database.copyDatabase(fromPath, toName, config);
        } else {
            addon.Database.copyDatabase(fromPath, toName);
        }
    }

    public static deleteDatabase(name: string, inDirectory: string): void {
        addon.Database.deleteDatabase(name, inDirectory);
    }

    public get name(): string {
        return this._inner.name;
    }

    public get path(): string {
        return this._inner.path;
    }

    public get count(): BigInt {
        return this._inner.count;
    }
    
    public get config(): DatabaseConfiguration {
        return this._inner.config;
    }

    public constructor(name: string, config?: DatabaseConfiguration) {
        if(!config) {
            this._inner = new addon.Database(name);
        } else {
            this._inner = new addon.Database(name, config);
        }
    }

    public deleteDatabase(): void {
        addon.Database.deleteDatabase();
    }

    public getDocument(id: string): Document {
        return this._inner.getDocument(id);
    }

    public getMutableDocument(id: string): MutableDocument {
        return this._inner.getMutableDocument(id);
    }

    public saveDocument(doc: MutableDocument): void {
        this._inner.saveDocument(doc);
    }
    
    public deleteDocument(doc: Document): void {
        this._inner.deleteDocument(doc);
    }

    public createValueIndex(name: string, config: ValueIndexConfiguration): void {
        this._inner.createValueIndex(name, config);
    }

    public createFullTextIndex(name: string, config: FullTextIndexConfiguration): void {
        this._inner.createFullTextIndex(name, config);
    }

    public deleteIndex(name: string): void {
        this._inner.deleteIndex(name);
    }

    public getIndexNames(): Array<string> {
        return this._inner.getIndexNames();
    }
    
    public createQuery(language: QueryLanguage, expressions: string): Query {
        return this._inner.createQuery(language, expressions);
    }
}

export interface Document {
    id: string
    revisionID: string
    sequence: BigInt
    propertiesAsJSON(): string
}

export interface MutableDocument extends Document {
    setPropertiesAsJSON(properties: string): void
}

export var MutableDocument: {
    new(): MutableDocument
    new(id: string): MutableDocument
} = addon.MutableDocument;

export enum QueryLanguage {
    JSON,
    N1QL
}

export interface ValueIndexConfiguration {
    expressionLanguage: QueryLanguage
    expressions: string
}

export var ValueIndexConfiguration: {
    new(): ValueIndexConfiguration
} = addon.ValueIndexConfiguration;

export interface FullTextIndexConfiguration {
    expressionLanguage: QueryLanguage
    expressions: string
    ignoreAccents: boolean
    language: string
}

export var FullTextIndexConfiguration: {
    new(): FullTextIndexConfiguration
} = addon.FullTextIndexConfiguration;

export interface Query {
    columnNames(): Array<string>
    explain(): string
    execute(): Array<Record<string, any>>
}

export class BlobMethods {
    public static isBlob(dict: Record<string, any>): boolean {
        return addon.Blob.isBlob(dict);
    }
}

export interface Blob {
    length: bigint
    contentType: string
    digest: string
}

export var Blob: {
    new(contentType: string, content: ArrayBuffer | Uint8Array): Blob
} = addon.Blob;