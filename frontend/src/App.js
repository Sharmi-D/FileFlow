import { useEffect, useState } from "react";
import axios from "axios";
import {
  Upload,
  Trash2,
  Download,
  Eye,
  Pencil,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

export default function App() {
  
  const API = process.env.REACT_APP_API_URL;

  const [files, setFiles] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState("");

  // create file
  const [showCreate, setShowCreate] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newContent, setNewContent] = useState("");

  // Load files from backend
  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API}/files`);
      setFiles(res.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Upload file
  const uploadFile = async () => {
    if (!selectedFile) {
      alert("Choose a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await axios.post(`${API}/upload`, formData);
      setSelectedFile(null);
      setShowUpload(false);
      fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  // Delete file
  const deleteFile = async (id) => {
    try {
      await axios.delete(`${API}/delete/${id}`);
      setDeleteId(null);
      fetchFiles();
    } catch (error) {
      console.log(error);
    }
  };

  // Download file
  const downloadFile = (url) => {
    window.open(url, "_blank");
  };

  // Detect file
  const getType = (name) => {
    const ext = name.split(".").pop().toLowerCase();

    if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
      return "Image";
    }
    return ext.toUpperCase();
  };

  // Search 
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  );

  // Create file
  const createFile = async () => {
    if (!newFileName) {
      alert("Enter filename");
      return;
    }

    try {
      await axios.post(`${API}/create-file`, {
        filename: newFileName,
        content: newContent,
      });
      
      setShowCreate(false);
      setNewFileName("");
      setNewContent("");
      fetchFiles();
    } catch (error) {
      console.log(error);
      alert("Failed to create file");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-60 bg-white shadow-md p-4">
        <h1 className="text-xl font-bold mb-6">MyDrive</h1>
        <ul className="space-y-3">
          <li className="font-medium">Dashboard</li>
          <li className="font-medium text-blue-500">My Files</li>
          <li>Images</li>
          <li>Documents</li>
          <li>Trash</li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-4">
          <input 
            placeholder="Search files..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-1/3"
          />

          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
          <Upload size={18} />
            Upload
          </button>

          <button onClick={() => setShowCreate(true)}
          className="bg-green-500 text-white px-4 py-2 rounded">
            Create File
          </button>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-5">
                    No files uploaded
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      {getType(file.name) === "Image" ? (
                        <ImageIcon size={18} />
                      ) : (
                        <FileText size={18} />
                      )}
                      {file.name}
                    </td>

                    <td>{getType(file.name)}</td>
                    <td>{file.size}</td>
                    <td>{file.date || "-"}</td>

                    <td className="flex gap-3 justify-center py-2">
                      <Eye
                        className="cursor-pointer"
                        onClick={() => setPreviewFile(file)}
                      />

                      <Download
                        className="cursor-pointer"
                        onClick={() => downloadFile(file.url)}
                      />

                      <Pencil className="cursor-pointer" />

                      <Trash2
                        className="text-red-500 cursor-pointer"
                        onClick={() => setDeleteId(file.id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-96">
            <h2 className="text-lg font-bold mb-4">Upload File</h2>

            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="mb-4"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowUpload(false)}>Cancel</button>

              <button
                onClick={uploadFile}
                className="bg-blue-500 text-white px-4 py-1 rounded"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[900px] max-h-[90vh] overflow-auto text-center">
            <h2 className="font-bold text-lg mb-4">{previewFile.name}</h2>
            
            {getType(previewFile.name) === "Image" ? (
              <img
              src={previewFile.url}
              alt="preview"
              className="max-w-full max-h-[75vh] mx-auto rounded"
              />
            ) : previewFile.name.toLowerCase().endsWith(".pdf") ? (
            
            <iframe
            src={`${previewFile.url}#view=FitH`}
            title="pdf"
            className="w-full h-[75vh] border rounded"
            />
            ) : previewFile.name.toLowerCase().endsWith(".pdf") ? (
          
            <embed
              src={previewFile.url}
              type="application/pdf"
              className="w-full h-[75vh]"
            />
            ) : (
            <p>No preview available for this file type</p>
            )}

            <button onClick={() => setPreviewFile(null)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >Close
            </button>
          </div>
        </div>
      )}

            

    {/* Delete Confirm */}
    {deleteId && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl">
          <p>Are you sure?</p>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setDeleteId(null)}>Cancel</button>
            <button onClick={() => deleteFile(deleteId)} className="bg-red-500 text-white px-4 py-1 rounded">
              Delete
            </button>
          </div>
        </div>
      </div>
    )}


    {/* Create File */}
    {showCreate && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-6 rounded-xl w-[500px]">
          <h2 className="text-lg font-bold mb-4">Create File</h2>

          <input
            type="text"
            placeholder="example.txt"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="border w-full p-2 mb-3 rounded"
          />

          <textarea
            placeholder="Write content..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="border w-full p-2 h-40 rounded"
          />

          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowCreate(false)}>Cancel</button>
    
            <button
              onClick={createFile}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
