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