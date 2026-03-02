import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";

if (cluster.isPrimary) {
	const numWorkers = os.availableParallelism();
	console.log(`Primary ${process.pid} starting ${numWorkers} workers...`);

	for (let i = 0; i < numWorkers; i++) cluster.fork();

	cluster.on("exit", (worker, code) => {
		console.log(`Worker ${worker.process.pid} exited (code: ${code})`);
		if (code !== 0) cluster.fork();
	});
} else {
	await import("./main");
	console.log(`Worker ${process.pid} started`);
}

export type { App } from "./main";
