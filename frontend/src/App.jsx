import { use, useState } from 'react'
import './App.css'
import { supabase } from "./supabaseClient"

function App() {
  const [count, setCount] = useState(0);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {error, data} = await supabase
    .from("test")
    .insert
    ({title, task})
    .select()
    .single();

    if (error){
      console.log("didn't work bud", error.message);
    }
    else{
      console.log(data);
    } 

    setTask("");
    setTitle("");
  };


  function changeTitle(e){
    setTitle(e.target.value);
    console.log("this is title: ", title);
  } 
  function changeTask(e){
    setTask(e.target.value);
    console.log("this is task: ", task);
  } 

  return (
    <div>
      <form onSubmit={ handleSubmit}>
        <label htmlFor="">Input title</label>
        <input type="text" onChange={ (e) => changeTitle(e)}/>
        <label htmlFor="">Input task</label>
        <input type="text" name="" id="" style={{ backgroundColor: "red" }} onChange={ (e) => changeTask(e)}/>
        <button type='submit'>submit lil bro</button>
      </form>
    </div>
  )
}

export default App
/***
 * 
 * 
 */