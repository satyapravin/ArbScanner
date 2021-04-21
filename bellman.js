const bellmanFord = function(G, S) {
	N = 0
	V = G.length;
	let negativeCyclePresent = false;

	for (var ll=0; ll < S.length; ++ll) 
	{
		paths = new Array(V).fill(-1);
		dist = new Array(V).fill(Infinity);
		dist[S[ll]] = 0;
	
		for (var kk=0; kk < V+2; ++kk)
		{
			for(var ii=0; ii < V; ++ii)
			{
				for(var jj=0; jj < V; ++jj)
				{
					if (dist[ii] < Infinity && dist[ii] + G[ii][jj] < dist[jj])
					{
						if (kk > V) negativeCyclePresent = true;
						dist[jj] = dist[ii] + G[ii][jj];
						paths[jj] = ii;
					}
				}
			}	  
		}


		if (negativeCyclePresent) {
			return [negativeCyclePresent, paths]
		}
	}

  	return [false, null];
}

module.exports = {bellmanFord};