import { spawnSync } from 'node:child_process';
const suites=['validation.cjs','packing.cjs','save.cjs','navigation.cjs','education.cjs','contact-choice.cjs','recruitment.mjs','hr-auth.mjs','mail.mjs','cabinet-v8.mjs'];
for (const file of suites) {
  const result=spawnSync(process.execPath,['tests/'+file],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status||1);
}
