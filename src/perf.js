import { reduce, map } from 'ramda';

const mongoPerf = [
  { key: 'types', value: 106.594 },
  { key: 'dataflows', value: 46027.276 },
  { key: 'dataflowsLangSimpleQuery', value: 2407.466 },
  { key: 'groupTypes', value: 432.789 },
];

const filesMoy = perfList => Math.ceil(reduce((acc, { value }) => acc + value, 0, perfList) / perfList.length);

const printPerfByKey = perfList => map(({ key, value }) => console.log(`${key} : ${value} ms`), perfList);

const printPerf = perfList => {
  console.log('========================================');
  printPerfByKey(perfList);
  console.log('========================================');
  console.log(`Moyenne : ${filesMoy(perfList)} ms`);
  console.log('========================================');
};

const filesPerf = [
  { key: 'types', value: 22.454 },
  { key: 'dataflows', value: 3370.100 },
  { key: 'dataflowsLangSimpleQuery', value: 1123.530 },
  { key: 'groupTypes', value: 210.340 },
];


const printAllPerf = () => {
  console.log('filesPerf : ');
  printPerf(filesPerf);
  console.log('mongoPerf : ');
  printPerf(mongoPerf);
};

printAllPerf();
