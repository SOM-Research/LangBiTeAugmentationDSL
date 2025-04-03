grammar LangBiTeAugmentationDSL


terminal ID: /[_a-zA-Z][\w_]*/;
terminal STRING: /"[^"]*"|'[^']*'/;
terminal INT returns number: /[1-9][0-9]*/;


hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;

entry Model:
    (ethicalConcerns+=EthicalConcern | sensitiveCommunities+=SensitiveCommunity)+
    (contexts+=Context | scenarios+=Scenario)+
    (augmentations+=Augmentation)+
    augmentationSetup=AugmentationSetup;

EthicalConcern:
    'ethicalConcern'
    name=ID
    description=STRING
    markup=STRING
    ('[' (communities+=[SensitiveCommunity:ID])
        ((','communities+=[SensitiveCommunity:ID])*']'))?;

SensitiveCommunity:
    'sensitiveCommunity'
    name=ID
    description=STRING;

Context:
  'context' name=ID description=STRING
  '[' (scenarios+=[Scenario:ID])
    ((','scenarios+=[Scenario:ID])* ']');

Scenario:
  'scenario' name=ID description=STRING;

AugmentationSetup:
  'augmentationSetup'
  'nTemplates:' nTemplates=INT
  'llm:' llm=LLM
  'augmentations:' (augmentations+=Augmentation)+;

Augmentation:
  'augmentation'
  'concern:' concern=[EthicalConcern:ID]
  'context:' context=[Context:ID]
  'representativeCommunities:'
    '[' representativeCommunities+=[SensitiveCommunity:ID]
      (',' '(' representativeCommunities+=[SensitiveCommunity:ID] ')')* ']'
  ('selectedScenarios:' '[' selectedScenarios+=[Scenario:ID]
    (',' '(' selectedScenarios+=[Scenario:ID] ')')* ']')?;


LLM returns string: 'OpenAIGPT4Turbo' | 'OpenAIGPT4o';
