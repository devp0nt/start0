// This is a test file for gen0

// @gen0:start print("// x"); print("// y")
// x
// y
// @gen0:end

// @gen0:start $.x = await importFromTsFiles({ globPattern: "~/**/route{s,}.*.ts", exportEndsWith: "TrpcRoute" })

// @gen0:end
