import { Dex, Edge } from "./model"


// 1. build defi graph
// 2. negative crycle detecation
// 3. greedy search 
// 4. repeat step 1-3 to get the highest profit
// 5. valudation by concreate execution locally
export class BellManFord {
    public graph: Edge[] = [];

    initialize(start: string): [Map<string, number>, Map<string, string>, Map<string, boolean>] {
        // Stands for destination
        let d = new Map<string, number>();
        // Stands for predecessor
        let p = new Map<string, string>();
        let discovered = new Map<string, boolean>();
        for (let edge of this.graph) {
            // We start admiting that the rest of nodes are very very far
            d.set(edge.u, Number.MAX_SAFE_INTEGER);
            // We start with no predecessor
            p.set(edge.u, "");
            // We start with no discovered nodes
            discovered.set(edge.u, false);
        }
        d.set(start, 0);
        // For the start we know how to reach
        return [d, p, discovered];
    }

    relax(edge: Edge, d: Map<string, number>, p: Map<string, string>) {
        //  If the distance between the node and the neighbour is lower than the one I have now
        if (d.get(edge.v)! > edge.weight + d.get(edge.u)!) {
            //  Record this lower distance
            d.set(edge.v, d.get(edge.u)! + edge.weight);
            p.set(edge.v, edge.u);
        }
    }

    bellman_ford(start: string): Edge[][] {
        let d = new Map<string, number>();
        let p = new Map<string, string>();
        let discovered = new Map<string, boolean>();
        [d, p, discovered] = this.initialize(start);

        console.log("e1 d: ", d, "p: ", p, "discovered: ", discovered)
        // We iterate over all the nodes
        for (let i = 0; i < this.graph.length - 1; i++) {
            // We iterate over all the edges
            for (let edge of this.graph) {
                this.relax(edge, d, p);
            }
        }

        console.log("e2 d: ", d, "p: ", p, "new_discorded: ", discovered)
        // let neg_circles: string[][] = [];
        let neg_circles: Edge[][] = [];
        // We iterate over all the edges one more time
        for (let edge of this.graph) {
            if (discovered.get(edge.u)) {
                continue;
            }

            // if d[u] is negative, and d[v] > d[u] + weight, there is must have a negative cycle.
            // we should find the circle path from u to v, iterate it.
            if (d.get(edge.v)! > edge.weight + d.get(edge.u)!) {
                console.log("e3 u: %s, d[u]: %s, v: %s, d[v]: %s and latest weight: %s", edge.u, d.get(edge.u), edge.v, d.get(edge.v), edge.weight + d.get(edge.u)!);
                let temp: string = edge.u;
                let circle: string[] = [];
                circle.push(temp);
                discovered.set(temp, true);
                temp = p.get(temp)!;

                while (!circle.includes(temp) && temp != edge.u) {
                    circle.push(temp);
                    discovered.set(temp, true);
                    temp = p.get(temp)!;
                }

                let temp_pos: number = circle.indexOf(temp)
                circle.push(temp);
                circle = circle.slice(temp_pos, circle.length);
                circle.reverse()
                let edge_circle: Edge[] = [];
                for (let i = 0; i < circle.length - 1; ++i) {
                    for (let edge of this.graph) {
                        if (circle[i] == edge.u && circle[i + 1] == edge.v) {
                            edge_circle.push(edge);
                        }
                    }
                }
                neg_circles.push(edge_circle);
                console.log("e4 circle: ", circle, ", neg_circles: ", neg_circles, ", edge_circle: ", edge_circle);
            }
        }

        return neg_circles;
    }


    start(_graph: Edge[]): [Edge[], number] {
        if (_graph.length == 0) {
            return [[], 0];
        }

        this.graph = _graph
        let all_neg_circles: Edge[][] = [];
        let best_path: Edge[] = []
        let fina_profit: number = 0;

        let neg_circles: Edge[][] = [];
        // for (let edge of this.graph) {
        //     neg_circles = this.bellman_ford(edge.u);
        // }

        neg_circles = this.bellman_ford(this.graph[0].u);
        console.log("e6 neg_circles: ", neg_circles);
        for (let circle of neg_circles) {
            if (all_neg_circles.includes(circle)) continue;
            let profit = this.get_profit(circle)
            if (profit > fina_profit) {
                fina_profit = profit
                best_path = circle
            }
            all_neg_circles.push(circle)
        }

        console.log("all_neg_circles: ", all_neg_circles)
        console.log("best_path: ", best_path, ", fina_profit: ", fina_profit)
        return [best_path, fina_profit];
    }

    // p1*p2*...pn > 1
    get_profit(circle: Edge[]): number {
        let profit: number = 0;
        for (let edge of circle) {
            profit += edge.weight;
        }

        return -profit;
    }
}
