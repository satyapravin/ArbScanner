const bellmanFord = function(G, S) {
	N = 0
	V = G.length;
	var retPaths = {}

	for (var ll=0; ll < S.length; ++ll) 
	{
		let negativeCyclePresent = false;
		paths = new Array(V).fill(-1);
		dist = new Array(V).fill(Infinity);
		dist[S[ll]] = 0;
	
		for (var kk=0; kk < V+2; ++kk)
		{
			for(var ii=0; ii < V; ++ii)
			{
				for(var jj=0; jj < V; ++jj)
				{
					if (ii != jj && dist[ii] < Infinity && dist[ii] + G[ii][jj] < dist[jj])
					{
						if (kk >= V-1) negativeCyclePresent = true;
						dist[jj] = dist[ii] + G[ii][jj];
						paths[jj] = ii;
					}
				}
			}	  
		}


		if (negativeCyclePresent) {
			retPaths[S[ll]] = paths
		}
	}

  	return [Object.keys(retPaths).length > 0, retPaths];
}

module.exports = {bellmanFord};