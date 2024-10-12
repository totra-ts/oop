function runBenchmark() {
  const iterations = 1_000_000;

  // Variant 1: Map with string keys
  const stringMap = new Map<string, any>();
  // Set up
  const stringKeys: string[] = Array.from(
    Array(iterations),
    (_, i) => `key${i}`
  );
  // Test
  console.time("String Map (set)");

  for (let i = 0; i < iterations; i++) {
    stringMap.set(stringKeys[i], i);
  }
  console.timeEnd("String Map (set)");

  console.time("String Map (get)");
  for (let i = 0; i < iterations; i++) {
    stringMap.get(stringKeys[i]);
  }
  console.timeEnd("String Map (get)");

  // Variant 2: Map with constructor function keys
  const functionMap = new Map<Function, any>();

  const classKeys: Function[] = Array.from(
    Array(iterations),
    (_, i) =>
      class {
        name = `key${i}`;
      }
  );

  console.time("Function Map (set)");
  for (let i = 0; i < iterations; i++) {
    functionMap.set(classKeys[i], i);
  }
  console.timeEnd("Function Map (set)");

  console.time("Function Map (get)");
  for (let i = 0; i < iterations; i++) {
    functionMap.get(classKeys[i]);
  }
  console.timeEnd("Function Map (get)");
}

runBenchmark();
