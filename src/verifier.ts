// 3rd party dependencies
import Ajv from "ajv";

// local dependencies
import { EventName } from "./event";
import { log } from "./log";

const ajv = new Ajv();

const mapObject = (o: Object, f: Function) => {
    var result = {};
    Object.keys(o).forEach(function(k) {
        result[k] = f.call(this, o[k], k, o); 
    });
    return result;
}

export type IValidatablePropertyType = "number" | "integer" | "string" | "boolean" | "array" | "null" | "object";

export interface IValidatableProperty {
    type: IValidatablePropertyType;
    nullable?: boolean;
    minLength?: number;
    maxLength?: number
    required?: boolean
}

export interface IValidatableProperties {
    [key: string]: IValidatableProperty;
}

export class ValidatableEvent {
    name: EventName;
    properties: IValidatableProperties;
    validate: any;

    private schema: Object;

    constructor(name: EventName, properties: IValidatableProperties, additional: boolean = true) {
        this.name = name;
        
        const required = Object.entries(properties).filter(v => v[1]?.required).map(p => p[0]);
        
        this.properties = mapObject(properties, (p: IValidatableProperty) => {
            delete p.required;

            if (p.type != "string") {
                delete p.minLength;
                delete p.maxLength;
            }

            return p;
        });
        
        this.schema = {
            type: "object",
            properties: this.properties,
            required: required,
            additionalProperties: additional
        };

        try {
            this.validate = ajv.compile(this.schema);
        }
        catch {
            log.error("Error compiling ValidatableEvent, invalid schema")
        }
    }
}