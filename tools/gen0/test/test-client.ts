// This is a test file for gen0

// @gen0:start
// @gen0:end

// @gen0:start await importExportedFromFiles("~/**/route{s,}.*.ts", "TrpcRoute");
// @gen0:end

// @gen0:start $.imports.map(im => print(`export const ${im.cutted} = ${im.name}`))
// @gen0:end

export const message = "Hello from gen0"
