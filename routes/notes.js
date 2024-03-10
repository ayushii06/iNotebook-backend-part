const express=require('express');
const router=express.Router();
const Notes = require('../modules/Notes');
const fetchuser = require('../middleware/fetchuser');
const {body,validationResult}=require('express-validator');



//Route 1 :Get all the notes GET "/api/notes/getuser"
router.get('/fetchallnotes',fetchuser,async (req,res)=>{
    try {
        
    
   const notes = await Notes.find({user:req.user.id});
    res.json(notes)
    }catch (error) {
        console.error(error.message);
      res.status(500).send('Internal Server Error');
    }   
    
})

//Route 2 :Add note POST "/api/auth/addnotes". Login required
router.post('/addnote',fetchuser,[
    body('title','Invalid title').isLength({min:3}),
   body('description','invalid description').isLength({min:3}),
], async (req,res)=>{
    try {
        
   
    const{title,description,tag}=req.body;
    const error=validationResult(req);
    if(!error.isEmpty()){
      return res.status(400).json({error:error.array()});
    }

    const note = new Notes({
        title,description,tag,user:req.user.id

    }) 
    const savedNote=await note.save()
    res.json(savedNote)
} catch (error) {
    console.error(error.message);
    res.status(500).send('Internal Server Error');
}
 })


//Route 3 :Update a note PUT: "/api/notes/updatenote" login required
router.put('/updatenote/:id',fetchuser,async (req,res)=>{
    try {
    //get the data
    const {title,description,tag}=req.body;
    //creating a new note

    const newNote = {};
    //if there is title to update put it in newNote.
    if(title){newNote.title=title};
    if(description){newNote.description=description};
    if(tag){newNote.tag=tag};

    let note=await Notes.findById(req.params.id)
    if(!note){
        return res.status(404).send('Not Found')
    }
    if(note.user.toString()!==req.user.id){
        return res.status(401).send("Not Allowed");
    }

    note=await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note});
    
    }catch (error) {
        console.error(error.message);
      res.status(500).send('Internal Server Error');
    }   
    
})

//Route 4 : delete note DELETE "/api/notes/getuser"
router.delete('/deletenode/:id',fetchuser,async (req,res)=>{
    try {
        
        //FIND NOTE TO BE DELETED AND DELETE IT
    
        let note=await Notes.findById(req.params.id)
        if(!note){
            return res.status(404).send('Not Found')
        }

        //ALLOW DELETION ONLY IF THE USER OWNS IT
        if(note.user.toString()!==req.user.id){
            return res.status(401).send("Not Allowed");
        }
    
        note=await Notes.findByIdAndDelete(req.params.id)
        res.json({"Success":"Note has been deleted"});
        
        }catch (error) {
            console.error(error.message);
          res.status(500).send('Internal Server Error');
        }    
    
})



module.exports = router