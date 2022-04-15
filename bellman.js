const bellmanFord = function(G, S) {
	N = 0
	V = G.length;
	var retPaths = {}
	let negativeCyclePresent = false;

	for (var ll=0; ll < S.length; ++ll) {
		root = S[ll]

		for (var kk=0; kk < V; ++kk) {
			if (kk !== root) {
				for (var jj=0; jj < V; ++jj) {
					if (jj !== root ) {
						if (kk !== jj) {
							ret = G[root][jj] + G[jj][kk] + G[kk][root]
							if (ret < 0) {
								negativeCyclePresent = true;
								retPaths[ret] = [root, jj, kk, root]
							}
							ret = G[root][kk] + G[kk][jj] + G[jj][root]
							if (ret < 0) {
								negativeCyclePresent = true;
								retPaths[ret] = [root, kk, jj, root]
							}
						}
					}
				}
			}			
		}
	}

	path = []
	retrate = 0
	if (negativeCyclePresent) {
		var sorted = [];
		for(var key in retPaths) {
			sorted[sorted.length] = key;
		}
		sorted.sort();
		path = retPaths[sorted[0]]
		retrate = sorted[0]
	}

  	return [negativeCyclePresent, path, retrate];
}

module.exports = {bellmanFord};