// source: https://dcc.fceia.unr.edu.ar/sites/default/files/uploads/materias/fruchterman.pdf
export const fruchtAndReinAttraction = ({d, k}) => (d ** 2) / k;
export const fruchtAndReinRepulsion = ({d, k}) => (k ** 2) / d;

// eslint-disable-next-line max-len
// adjusted from reference in http://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=D9D99C9FE68668217EE98749864C197A?doi=10.1.1.20.5663&rep=rep1&type=pdf
export const eadesAttraction = ({d, k1, k2}) => k1 * Math.log(k2 * d);
export const eadesRepulsion = ({d, k3}) => k3 / (d ** 2);
