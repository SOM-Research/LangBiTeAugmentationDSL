import { AstNode, LangiumParser} from 'langium';
import { createAugmenterServices } from '../language/langbite-augmentation-dsl-module.js';
import { Model, isModel } from '../language/generated/ast.js';
import { NodeFileSystem } from 'langium/node';


export interface Generator {
    // Load the Abstract Syntax Tree of the .ethics active file
    generate(model : string | AstNode) : string | undefined;
    // Receives the parsed AST, generates the JSON string, and returns it
    model2Json(model : Model) : string | undefined;
}
 
/**
* JSON generator service main class
*/
export class DocumentationGenerator implements Generator {

    private readonly parser: LangiumParser;

    constructor() {       
        const services = createAugmenterServices(NodeFileSystem);
        this.parser = services.Augmenter.parser.LangiumParser;
    }

    generate(model : string) : string | undefined { // | AstNode) : string | undefined {
        //const astNode = (typeof(Model) == 'string' ? this.parser.parse(Model).value : Model);
        //return (isModel(astNode) ? this.model2Html(astNode) : undefined);
        const astNode = this.parser.parse(model).value;
        return (isModel(astNode) ? this.model2Json(astNode) : undefined);
    }

    // Generation of the output JSON string
    model2Json(model : Model) : string | undefined {

        const concernsModel = model.ethicalConcerns;
        const concerns = new Array();
        concernsModel.forEach( ec => {
            let ecCommsRefs = ec.communities;
            let ecComms = model.sensitiveCommunities.flatMap(c => ecCommsRefs.map(c2 => c2.$refText).includes(c.name)).values;
            let concern = {
                concern : ec.name,
                markup : ec.markup.toUpperCase(),
                communities : ecComms
            }
            concerns.push(concern);
        });

        const augmentationsModel = model.augmentations;
        const augmentations = new Array();
        augmentationsModel.forEach( a => {
            let augmentation = {
                concern : a.concern,
                context : a.context
            }
            augmentations.push(augmentation)
        });
        
        const setup = {
            num_templates : model.augmentationSetup.nTemplates,
            llm : model.augmentationSetup.llm,
            concerns : concerns,
            augmentations : augmentations
        };

        return JSON.stringify(setup);
    }
}
 