import  express from "express";
import corns from "corns";
import fs from "fs";
import morgan from "morgan";
const app=express();
const port=6000;
app.use(corns());
app.use(morgan());
app.use(express.json);
app.use(express.urlencoded({extended:true}));
const logger=(req,res,next)=>
    {
    const start=Date.now();
    res.on("finish",()=>
    {
        const period=Date.now()-start;
        const log='${req.method}${req.url}${res.status}${period}ms\n';
        fs.appendFile("./server.log",log,(err)=>
        {
            if(err)
            {
                console.log(err);
            }

        });
        next();
        app.use(logger)
    });
    app.post("/api/v1/patient",(req,res)=>
    {
        const newPatient=req.body;
        console.log("creating new patient: ",newPatient);
        res.status(201).send("Patient created");
    });
    app.get("/api/v1/patients/:id",(req,res)=>
    {
        const validatePatient=(req,res,next)=>
        {
            const {name,age,ward}=res.body;
            if(!name||!age||!ward){
                return res.status(404).send("no data");
            }
        }
    });
 app.use((err,req,res,next)=>

    {
        console.error(err.start);
        const status=err.status||500;
        const message=err.message;
        res.status(status).send("message");
    });
    app.use((req,res,next)=>{
        res.status(404).send("Not found");
    });

}

