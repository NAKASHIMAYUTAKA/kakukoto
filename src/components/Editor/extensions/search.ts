import {search, openSearchPanel} from '@codemirror/search';

export const searchExtension = [
  search({
    top: false,
  }),
];

export {openSearchPanel};
