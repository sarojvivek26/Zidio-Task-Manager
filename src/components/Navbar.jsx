import React from "react";
import { FaBell, FaSearch, FaPlus, FaComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setOpenSidebar } from "../redux/slices/authSlice";
import { FaBars } from "react-icons/fa";
import UserAvatar from "./UserAvatar";
import NotificationPanel from "./NotificationPanel";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return (
    <div className='w-full h-16 bg-dark-card flex items-center justify-between px-4 md:px-8'>
      <div className='flex items-center gap-4'>
        <button
          onClick={() => dispatch(setOpenSidebar(true))}
          className='text-white/60 hover:text-white md:hidden'
        >
          <FaBars size={20} />
        </button>
        <div className='relative'>
          <input
            type='text'
            placeholder='Search...'
            className='w-40 md:w-64 px-4 py-2 rounded-lg bg-dark-card text-white border border-white/10 focus:border-primary focus:outline-none'
          />
          <FaSearch className='absolute right-3 top-3 text-white/60' />
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <button
          onClick={() => navigate("/meetings/new")}
          className='flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all duration-300'
        >
          <FaPlus />
          <span className='hidden md:block'>New Meeting</span>
        </button>
        <button
          onClick={() => navigate("/chat")}
          className='flex items-center gap-2 px-4 py-2 rounded-lg text-white/60 hover:text-white transition-all duration-300'
          title="Chat"
        >
          <FaComments size={20} />
        </button>
        <NotificationPanel />
        <UserAvatar />
      </div>
    </div>
  );
};

export default Navbar;
