import type { ValidationAcceptor, ValidationChecks } from 'langium';
import type { Model, LangBiTeAugmentationDSLAstType, Augmentation } from './generated/ast.js';
import type { AugmenterServices } from './langbite-augmentation-dsl-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: AugmenterServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.AugmenterValidator;
    const checks: ValidationChecks<LangBiTeAugmentationDSLAstType> = {
        // Well-formed rules
        // 1. Representative communities are of its concern, and selected scenarios are of its context
        Augmentation: [validator.checkCommunitiesAreOfEthicalConcern, validator.checkScenariosAreOfContext],
        // 2. Unique IDs for each entity
        Model: [validator.checkEthicalConcernsAreUnique, validator.checkSensitiveCommunitiesAreUnique, validator.checkEthicalContextsAreUnique, validator.checkScenariosAreUnique]
    };
    registry.register(checks, validator);
}


export class AugmenterValidator {

    checkCommunitiesAreOfEthicalConcern(aug: Augmentation, accept: ValidationAcceptor): void {
        const concern = aug.concern;
        const concernCommunities = concern.ref?.communities.map(c => c.$refText);

        if (concernCommunities == undefined) return;

        aug.representativeCommunities.forEach(c => {
            if (!concernCommunities.includes(c.$refText)) {
                accept(
                    'error',
                    `Sensitive community '${c.$refText}' does not belong to ethical concern '${concern.$refText}' communities.`,
                    {node: aug, property: 'representativeCommunities'});
            }
        });
    }

    checkScenariosAreOfContext(aug: Augmentation, accept: ValidationAcceptor): void {
        const context = aug.context;
        const scenarios = context.ref?.scenarios.map(c => c.$refText);

        if (scenarios == undefined) return;

        aug.selectedScenarios.forEach(c => {
            if (!scenarios.includes(c.$refText)) {
                accept(
                    'error',
                    `Scenario '${c.$refText}' does not belong to context '${context.$refText}' scenarios.`,
                    {node: aug, property: 'selectedScenarios'});
            }
        });
    }

    checkEthicalConcernsAreUnique(model: Model, accept: ValidationAcceptor): void {
        this.checkElementsAreUnique(model, accept, model.ethicalConcerns);
    }

    checkSensitiveCommunitiesAreUnique(model: Model, accept: ValidationAcceptor): void {
        this.checkElementsAreUnique(model, accept, model.sensitiveCommunities);
    }

    checkEthicalContextsAreUnique(model: Model, accept: ValidationAcceptor): void {
        this.checkElementsAreUnique(model, accept, model.contexts);
    }

    checkScenariosAreUnique(model: Model, accept: ValidationAcceptor): void {
        this.checkElementsAreUnique(model, accept, model.scenarios);
    }


    checkElementsAreUnique(model: Model, accept: ValidationAcceptor, elements: any[]): void {
        const reported = new Set();
        elements.forEach(e => {
            if (reported.has(e.name)) {
                accept('error', `Element '${e.$type}' has non-unique name: '${e.name}'.`,  {node: e, property: 'name'});
            }
            reported.add(e.name);
        });
    }
}
