const bellmanFord = function(G, S) {
	N = 0
	V = G.length;
	dist = new Array(V).fill(null).map(() => new Array(V).fill(Infinity));
	paths = new Array(V).fill(null).map(() => new Array(V).fill(-1));
	for (var ii=0; ii < V; ++ii) {
		for(var jj=0; jj < V; ++jj) {
			dist[ii][jj] = G[ii][jj];
			paths[ii][jj] = jj;
		}
	}
		
	
	let negs = []
	for (var kk=0; kk < V; ++kk)
	{
	  if (!S.includes(kk)) continue;
	  for(var ii=0; ii < V; ++ii)
	  {
		for(var jj=0; jj < V; ++jj)
		{
			if (dist[ii][kk] + dist[kk][jj] < dist[ii][jj])
			{
				dist[ii][jj] = dist[ii][kk] + dist[kk][jj];
				paths[ii][jj] = paths[ii][kk];
			}
		}
	  }

	  if (dist[kk][kk] < -0.001) negs.push(kk)
	}
	
  return [negs, paths];
}

module.exports = {bellmanFord};