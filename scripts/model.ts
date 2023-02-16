export type Dex = {
    name: string;
    factory: string;
    router: string;
};

export type SwapData = {
    factory: string;
    router: string;
    token_in: string;
    token_out: string;
    amount_in: number;
}

export type PairNode = {
    dex: Dex;
    token_in: string;
    token_out: string;
    amount_in: number;
    ratio: number;
};

export class Edge {
    dex: Dex = {
        name: "",
        factory: "",
        router: ""
    };
    u: string;
    v: string;
    weight: number;

    constructor(_name: string = "", _factory: string = "", _router: string = "", _u: string, _v: string, _weight: number) {
        this.dex.name = _name == undefined ? "" : _name;
        this.dex.factory = _factory == undefined ? "" : _factory;
        this.dex.router = _router == undefined ? "" : _router;
        this.u = _u;
        this.v = _v;
        this.weight = -Math.log(_weight);
    }

    static getEdge(edges: Edge[], u: string, v: string): [Edge?] {
        for (let edge of edges) {
            if (edge.u == v && edge.v == u) {
                return [edge];
            }
        }
        return [undefined];
    }
}
