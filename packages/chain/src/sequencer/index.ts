import {
  VanillaGraphqlModules,
  GraphqlSequencerModule,
  GraphqlServer,
} from "@proto-kit/api";
import {
  SequencerModulesRecord,
  TimedBlockTrigger,
  BlockProducerModule,
  PrivateMempool
} from "@proto-kit/sequencer";
import { ModulesConfig } from "@proto-kit/common";
import { PrivateMempoolWithSort } from "./PrivateMempoolWithSort";
//import { PrivateMempoolWithSort } from "./PrivateMempoolWithSort";

export const apiSequencerModules = {
  GraphqlServer,
  Graphql: GraphqlSequencerModule.from({
    modules: VanillaGraphqlModules.with({}),
  }),
} satisfies SequencerModulesRecord;

export const apiSequencerModulesConfig = {
  Graphql: VanillaGraphqlModules.defaultConfig(),
  GraphqlServer: {
    port: Number(process.env.PROTOKIT_GRAPHQL_PORT),
    host: process.env.PROTOKIT_GRAPHQL_HOST!,
    graphiql: Boolean(process.env.PROTOKIT_GRAPHIQL_ENABLED),
  },
} satisfies ModulesConfig<typeof apiSequencerModules>;

export const baseSequencerModules = {
  ...apiSequencerModules,
  Mempool: PrivateMempoolWithSort,
  BlockProducerModule: BlockProducerModule,
  BlockTrigger: TimedBlockTrigger,
} satisfies SequencerModulesRecord;

export const baseSequencerModulesConfig = {
  ...apiSequencerModulesConfig,
  Mempool: {},
  BlockProducerModule: {},
  BlockTrigger: {
    blockInterval: Number(process.env.PROTOKIT_BLOCK_INTERVAL!),
    produceEmptyBlocks: true,
  },
} satisfies ModulesConfig<typeof baseSequencerModules>;
