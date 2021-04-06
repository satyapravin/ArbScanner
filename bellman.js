const bellmanFord = function(G, S) {
	N = 0
	V = G.length;
	paths = new Array(V+1).fill(-1);
	Graph = new Array(V+1).fill(null).map(() => new Array(V+1).fill(Infinity));
	dist = new Array(V+1).fill(Infinity);
	dist[0] = 0

	for (var ii in S) {
		Graph[0][S[ii]] = 0;
	}
	
	for (var ii=0; ii < V+1; ++ii) {
		paths[ii] = 0;

		for(var jj=0; jj < V+1; ++jj) {
			if (ii > 0 && jj > 0) {
				Graph[ii][jj] = G[ii-1][jj-1]
			}
		}
	}
	
	let negs = []

	for (var kk=0; kk < V; ++kk)
	{
	  for(var ii=0; ii < V; ++ii)
	  {
		for(var jj=0; jj < V; ++jj)
		{
			if (dist[ii] + Graph[ii][jj] < dist[jj])
			{
				if (kk >= V - 1 && S.includes(jj-1)) 
				{ 
					negs.push(jj-1)
				}
				
				dist[jj] = dist[ii] + Graph[ii][jj];
				paths[jj] = ii;
			}
		}
	  }	  
	}

	if (negs.length > 0) {
		for (var p in paths) paths[p] = paths[p] - 1
		paths.shift()
		return [negs.filter((item, i, ar) => ar.indexOf(item) === i), paths];
	}

  	return [[], paths];
}

module.exports = {bellmanFord};