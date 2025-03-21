import React, { useState } from "react";
import { useSelector } from "react-redux";
import Title from "../components/Title";
import Textbox from "../components/Textbox";
import Button from "../components/Button";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        toast.error("New passwords do not match!");
        return;
      }

      // Update user data in localStorage
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Settings updated successfully!");
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Title title="Settings" />
      
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Textbox
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
            
            <Textbox
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Textbox
                label="Current Password"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
              
              <Textbox
                label="New Password"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              
              <Textbox
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              label={isLoading ? "Saving..." : "Save Changes"}
              className="bg-blue-600 text-white"
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings; 