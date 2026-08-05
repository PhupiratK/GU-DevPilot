export function parseServices(data:string){

const lines = data.split("\n");

return lines
.filter(line=>line.includes("started") || line.includes("none"))
.map(line=>{

const parts=line.trim().split(/\s+/);


return {
    name: parts[0],
    status: parts[1]
};

});


}


export function parseServicePorts(data:string){

const lines = data.split("\n").slice(1);

const result: Record<string, number[]> = {};

lines.forEach(line=>{

const parts = line.trim().split(/\s+/);

if(parts.length < 9) return;

const command = parts[0].toLowerCase();
const port = Number(parts[8].split(":").pop());

if(!Number.isFinite(port)) return;

if(!result[command]) result[command] = [];
if(!result[command].includes(port)) result[command].push(port);

});

Object.keys(result).forEach(key=>{
    result[key].sort((a,b)=>a-b);
});

return result;

}