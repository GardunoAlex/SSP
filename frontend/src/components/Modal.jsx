import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { CircleX, PencilLine, CircleCheck } from 'lucide-react';


export default function Modal( {isOpen, setIsOpen}) {
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
    const [currUser, setCurrUser] = useState({});
    const [joined, setJoined] = useState("");
    const [edit, setEdit] = useState(false);
    const [newUserData, setNewUserData] = useState({name: currUser.name || "", school: currUser.school || "", major: currUser.major || "", gpa: currUser.gpa || "", role: currUser.role});


    
    useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // ✅ Check if response is OK before parsing JSON
            if (!res.ok) {
                throw new Error(`Server error: ${res.status} ${res.statusText}`);
            }

            // ✅ Check content-type to ensure it's JSON
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await res.text();
                console.error("Expected JSON but got:", text.substring(0, 200));
                throw new Error("Server returned non-JSON response");
            }

            const data = await res.json();
            const userData = data[0];
            setCurrUser(userData);
            const date = new Date(userData.created_at);
            const joinedDate = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
            setJoined(joinedDate);
        } catch (err) {
            console.error("Error fetching student:", err);
            // ✅ Optional: Set error state to show to user
            // setError(err.message);
        }
    };
    
    if (isAuthenticated) {
        fetchUserInfo();
    }
    }, [isAuthenticated, getAccessTokenSilently]);

    const handleSave = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newUserData),
                });

                if (!res.ok) throw new Error("Failed to update student");
                const updatedUser = await res.json();
                setCurrUser(updatedUser);
                setEdit(false);
        } catch (err) {
            console.log("error updating student: ", err);
        }
    }




    return (
        isOpen && (
            !edit ? (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className=" rounded-2xl shadow-XL p-5 w-full max-w-3xl h-full max-h-3xl flex items-center justify-center">
                        <div className="space-y-2 text-xl flex items-center w-full h-full">
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="relative">
                                    <button 
                                    onClick={() => setIsOpen(false)}
                                    className="absolute right-16 text-gray-500 text-indigo-600 hover:text-red-700 transition-colors duration-300"
                                    >
                                        <CircleX />
                                    </button>
                                    <button 
                                    onClick={() => setEdit(true)}
                                    className="absolute left-16 text-gray-500 text-indigo-600 hover:text-gray-700 "
                                    >
                                        <PencilLine />
                                    </button>
                                    </div>
                                        <img 
                                            src={user?.picture}
                                            alt="User avatar"
                                            className="w-25 h-25 rounded-full border-8 border-double border-indigo-600"
                                        />
                                        <h1 className="text-gray-700 text-2xl">{currUser.name}</h1>
                                        {(currUser.role === "student") ? 
                                            <>
                                                <p className="text-lg">School: {currUser.school}</p>
                                                <p className="text-lg">Major:{currUser.major} </p>
                                                <p className="text-lg">GPA: {currUser.gpa} </p>
                                                <p className="text-lg">Email: {currUser.email} </p>
                                                <p className="text-lg">Joined:{joined}</p>
                                            </>
                                            :
                                            <>
                                                <p className="text-lg">Email: {currUser.email} </p>
                                                <p className="text-lg">Joined:{joined}</p>
                                            </>
                                        }
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
            ) : (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className=" rounded-2xl shadow-XL p-5 w-full max-w-3xl h-full max-h-3xl flex items-center justify-center">
                        <div className="space-y-2 text-xl flex items-center w-full h-full">
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="relative">
                                    <button 
                                    onClick={handleSave}
                                    className="absolute right-16 text-gray-500 hover:text-green-700 transition-colors duration-300"
                                    >
                                        <CircleCheck />
                                    </button>
                                </div>
                                <img 
                                    src={user?.picture}
                                    alt="User avatar"
                                    className="w-25 h-25 rounded-full border-8 border-double border-indigo-600"
                                />
                                <p className="text-stone-400 text-base">Please fill out all fields</p>
                                
                                {(currUser.role === "student") ? 
                                    <>
                                        <label className="py-1 "> Name: 
                                            <input className="rounded-xl border-2 " type="text" name="name" value={newUserData.name} 
                                            onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})} placeholder={"  ..."} /> 
                                        </label>
                                        <label className="py-1"> School: 
                                            <input className=" rounded-xl border-2 " type="text" name="school" value={newUserData.school} 
                                            onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})} placeholder={"  ..."} />
                                        </label>
                                        <label className="py-1"> Major: 
                                            <input className=" rounded-xl border-2 " type="text" name="major" value={newUserData.major} 
                                            onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})} placeholder={"  ..."} />
                                        </label>
                                        <label className="py-1"> GPA: 
                                            <input className=" rounded-xl  border-2 " type="text" name="gpa" value={newUserData.gpa} 
                                            onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})} placeholder={"  ..."} />
                                        </label>
                                    </> 
                                    :
                                    <>
                                        <label className="py-1 "> Name: 
                                            <input className="rounded-xl border-2 " type="text" name="name" value={newUserData.name} 
                                            onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})} placeholder={"  ..."} /> 
                                        </label>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    );
}