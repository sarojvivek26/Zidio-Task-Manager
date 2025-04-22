import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IoChatbubbleEllipses, IoPeople } from 'react-icons/io5';
import { FaPlus, FaSearch } from 'react-icons/fa';
import Chat from './Chat';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [members, setMembers] = useState([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useSelector((state) => state.auth.user);
  const { chatId } = useParams();

  useEffect(() => {
    // Fetch user's chats from the server
    const fetchChats = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/chats/${currentUser._id}`);
        const data = await response.json();
        setChats(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    // Fetch all members
    const fetchMembers = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/users');
        const data = await response.json();
        // Filter out current user and sort alphabetically
        const sortedMembers = data
          .filter(user => user._id !== currentUser._id)
          .sort((a, b) => a.name.localeCompare(b.name));
        setMembers(sortedMembers);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchChats();
    fetchMembers();
  }, [currentUser._id]);

  const handleCreateGroup = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName,
          participants: [...selectedMembers, currentUser._id],
          isGroup: true,
        }),
      });

      if (response.ok) {
        const newChat = await response.json();
        setChats([...chats, newChat]);
        setShowNewGroupModal(false);
        setGroupName('');
        setSelectedMembers(new Set());
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const toggleMemberSelection = (memberId) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  // Group members by first letter
  const groupedMembers = members.reduce((groups, member) => {
    const firstLetter = member.name.charAt(0).toUpperCase();
    if (!groups[firstLetter]) {
      groups[firstLetter] = [];
    }
    groups[firstLetter].push(member);
    return groups;
  }, {});

  // Filter members based on search
  const filteredGroups = Object.entries(groupedMembers)
    .map(([letter, letterMembers]) => ({
      letter,
      members: letterMembers.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(group => group.members.length > 0);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar with chat list */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 border-b p-4">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Chats</h1>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-violet-500"
            />
          </div>
        </div>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto">
          {filteredGroups.map(({ letter, members }) => (
            <div key={letter} className="mb-2">
              {/* Section header */}
              <div className="px-4 py-1 bg-gray-50 sticky top-0 z-10">
                <span className="text-sm font-medium text-gray-500">{letter}</span>
              </div>
              {/* Members in this section */}
              {members.map((member) => (
                <Link
                  key={member._id}
                  to={`/chat/${member._id}`}
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors border-b ${
                    chatId === member._id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-blue-500 font-semibold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{member.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{member.status || 'Hey there! I am using TaskManager'}</p>
                  </div>
                  {member.online && (
                    <div className="w-3 h-3 bg-green-500 rounded-full ml-2 flex-shrink-0"></div>
                  )}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Right side chat area */}
      <div className="flex-1">
        {chatId ? (
          <Chat />
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <IoChatbubbleEllipses className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl">Select a contact to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList; 