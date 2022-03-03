export interface Bar {
    
}

export interface DataSocketKlineRes{
    e: string;
    E: number;
    s: string;
    k: DataSocketKlineItem
}

export interface DataSocketKlineItem{
    t: number;
    o: number;
    c: number;
    h: number;
    l: number;
    v: number;
}