import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { CircleX, PencilLine, CircleCheck } from 'lucide-react';


export default function Modal( {isOpen, setIsOpen}) {
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
    const [student, setStudent] = useState([]);
    const [joined, setJoined] = useState("");
    const [edit, setEdit] = useState(false);
    const [newUserData, setNewUserData] = useState({name: student.name || "", school: student.school || "", major: student.major || "", gpa: student.gpa || ""});


    
    useEffect(() => {
        const fetchUserInfo = async () => {
            try{
                const token = await getAccessTokenSilently();
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/student`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // data is an object -- I think -- that essentially holds the data that you just asked for. 
                const data = await res.json();
                const studentData = data[0];

                setStudent(studentData);

                const date = new Date(studentData.created_at);
                const joinedDate = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`;
                setJoined(joinedDate);
            } catch (err) {
                console.log("Error fetching student: ", err);
            }
        };
        fetchUserInfo();
    

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
                const updatedStudent = await res.json();
                setStudent(updatedStudent);
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
                                        <h1 className="text-gray-700">{student.name}</h1>
                                        <p className="text-indigo-400"><span className="font-medium text-gray-700">School:</span> {student.school}</p>
                                        <p className="text-indigo-400"><span className="font-medium text-gray-700">Major:</span>{student.major} </p>
                                        <p className="text-indigo-400"><span className="font-medium text-gray-700">GPA:</span> {student.gpa} </p>
                                        <p className="text-indigo-400"><span className="font-medium text-gray-700">Email:</span> {student.email} </p>
                                        <p className="text-indigo-400"><span className="font-medium text-gray-700">Joined:</span> {joined}</p>
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
                                <label className="py-1"> Name: 
                                    <input className=" rounded-xl bg-indigo-100 border-2 border-indigo-600" type="text" name="name" value={newUserData.name} onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})}/>
                                </label>
                                <label className="py-1"> School: 
                                    <input className=" rounded-xl bg-indigo-100 border-2 border-indigo-600" type="text" name="school" value={newUserData.school} onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})}/>
                                </label>
                                <label className="py-1"> Major: 
                                    <input className=" rounded-xl bg-indigo-100 border-2 border-indigo-600" type="text" name="major" value={newUserData.major} onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})}/>
                                </label>
                                <label className="py-1"> GPA: 
                                    <input className=" rounded-xl bg-indigo-100 border-2 border-indigo-600" type="text" name="gpa" value={newUserData.gpa} onChange={(e) => setNewUserData({ ...newUserData, [e.target.name]: e.target.value})}/>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )
        )
    );
}