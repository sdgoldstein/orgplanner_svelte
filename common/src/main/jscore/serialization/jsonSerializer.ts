
import {SerializationFormat, type SerializationHelper, type Serializer} from "./serializationService";

abstract class BaseJSONSerializer implements Serializer<SerializationFormat.JSON>
{
    serialize(serializableObject: any, serializationHelper: SerializationHelper<SerializationFormat.JSON>): string
    {
        let json = "{";

        const objectValue: Record<string, string> = this.getValue(serializableObject, serializationHelper);

        const objectValueEntries = Object.entries(objectValue);

        for (let i = 0; i < objectValueEntries.length; i++)
        {
            const [nextKey, nextValue] = objectValueEntries[i];

            json = this._addLineAndIndent(json, serializationHelper.depth);
            json += this._serializeKey(nextKey, nextValue);

            if (i < (objectValueEntries.length - 1))
            {
                json += ",";
            }
        }

        json = this._addLineAndIndent(json, serializationHelper.depth - 1);
        json += "}"

        return json;
    }
    protected serializeIterable(serializableIterator: IterableIterator<any>,
                                serializationHelper: SerializationHelper<SerializationFormat.JSON>): string
    {
        let json = "[";

        let nextSerializable = serializableIterator.next();
        while (!nextSerializable.done)
        {
            json += serializationHelper.serialize(nextSerializable.value);

            nextSerializable = serializableIterator.next();

            if (!nextSerializable.done)
            {
                json += ",";
                json = this._addLineAndIndent(json, serializationHelper.depth);
            }
        }

        json += "]";

        return json;
    }

    deserialize<T>(data: string, serializationHelper: SerializationHelper<SerializationFormat.JSON>): T
    {
        throw new Error("Method not implemented.");
    }

    abstract getValue(serializableObject: any,
                      serializationHelper: SerializationHelper<SerializationFormat.JSON>): Record<string, string>;

    private _serializeKey(key: string, value: string): string
    {
        // FIXME - Hack for now.  Ideally, values need to not just be strings but objects that indicate, value, object
        // value, or array value
        let valueToInclude = value.startsWith("{") || value.startsWith("[") ? value : `"${value}"`;
        return `"${key}": ${valueToInclude}`;
    }

    private _addLineAndIndent(json: string, depth: number): string
    {
        json += "\n";
        for (let i = 0; i < depth; i++)
        {
            json += "\t";
        }

        return json;
    }
}

class JSONStringBuilder
{
    private _commaNeeded: boolean = false;
    private _json: string = "{";
    private _indentLevel = 1;

    private appendPre(): void
    {
        this._addCommaIfNeeded();
        this._addLineAndIndent();
    }

    appendKey(key: string, value: string): void
    {
        this.appendPre();
        this._json += `"${key}": "${value}"`;
        this._setCommaNeeded();
    }

    appendBooleanKey(key: string, value: boolean): void
    {
        this.appendPre();
        this._json += `"${key}": ${value}`;
        this._setCommaNeeded();
    }

    appendObjectKey(key: string): void
    {
        this.appendPre();
        this._json += `"${key}": {`;
        this._indentLevel++;
    }

    appendArrayKey(key: string): void
    {
        this.appendPre();
        this._json += `"${key}": [`;
        this._indentLevel++;
    }

    appendArrayObjectValue(): void
    {
        this.appendPre();
        this._json += "{";
        this._indentLevel++;
    }

    closeArrayObjectValue(): void
    {
        this._indentLevel--;
        this._addLineAndIndent();
        this._json += "}";
        this._setCommaNeeded();
    }

    closeArrayKey(): void
    {
        this._indentLevel--;

        this._addLineAndIndent();

        this._json += "]";

        this._setCommaNeeded();
    }

    closeObjectKey(): void
    {
        this._indentLevel--;
        this._addLineAndIndent();
        this._json += "}";
        this._setCommaNeeded();
    }

    private _addLineAndIndent(): void
    {
        this._json += "\n";
        for (let i = 0; i < this._indentLevel; i++)
        {
            this._json += "\t";
        }
    }

    private _addCommaIfNeeded(): void
    {
        if (this._commaNeeded)
        {
            this._json += ",";
            this._commaNeeded = false;
        }
    }

    private _setCommaNeeded(): void
    {
        this._commaNeeded = true;
    }

    toString(): string
    {
        this._json += "\n}";
        return this._json;
    }
}

export {BaseJSONSerializer, JSONStringBuilder};