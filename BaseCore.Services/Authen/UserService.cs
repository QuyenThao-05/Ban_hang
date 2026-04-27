using BaseCore.Entities;
using BaseCore.Repository.Authen;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services.Authen
{
    public interface IUserService
    {
        Task<User> Authenticate(string username, string password);
        Task<List<User>> GetAll();
        Task<User> GetById(int id);
        Task<User> Create(User user, string password);
        Task Update(User user, string password = null);
        Task Delete(int id);
        Task<(List<User> Users, int TotalCount)> Search(string? keyword, int page, int pageSize);
    }

    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;

        public UserService(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        // 🔥 LOGIN CHUẨN
        public async Task<User> Authenticate(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                return null;

            var user = await _userRepository.GetByUsernameAsync(username);

            if (user == null)
                return null;

            // 👉 so sánh trực tiếp (plain text)
            if (user.Password != password)
                return null;

            return user;
        }

        public async Task<List<User>> GetAll()
        {
            return await _userRepository.GetAllAsync();
        }

        public async Task<User> GetById(int id)
        {
            return await _userRepository.GetByIdAsync(id);
        }

        // CREATE USER
        // =====================================================
        public async Task<User> Create(
            User user,
            string password)
        {
            // ⚠ Validate
            if (string.IsNullOrEmpty(user.Username))
                throw new Exception(
                    "Username không được để trống");

            if (string.IsNullOrEmpty(password))
                throw new Exception(
                    "Password không được để trống");

            // 🚫 Check trùng username
            var existingUser =
                await _userRepository.GetByUsernameAsync(
                    user.Username);

            if (existingUser != null)
                throw new Exception(
                    "Username đã tồn tại");

            // 🔐 Lưu plain text
            user.Password = password;

            // 🎯 Default
            user.Role ??= "user";
            user.IsActive = true;
            user.CreatedAt = DateTime.Now;

            await _userRepository.CreateAsync(user);

            return user;
        }

        // UPDATE USER
        // =====================================================
        public async Task Update(
            User user,
            string? password = null)
        {
            var existingUser =
                await _userRepository.GetByIdAsync(
                    user.Id);

            if (existingUser == null)
                throw new Exception(
                    "User không tồn tại");

            // ✏ Update fields
            existingUser.FullName = user.FullName;
            existingUser.Email = user.Email;
            existingUser.Phone = user.Phone;
            existingUser.Address = user.Address;
            existingUser.Role = user.Role;
            existingUser.IsActive = user.IsActive;

            // 🔐 Update password nếu có
            if (!string.IsNullOrEmpty(password))
            {
                existingUser.Password = password;
            }

            await _userRepository.UpdateAsync(
                existingUser);
        }


        // =====================================================
        // DELETE USER
        // =====================================================
        public async Task Delete(int id)
        {
            await _userRepository.DeleteAsync(id);
        }

        // =====================================================
        // SEARCH + PAGINATION
        // =====================================================
        public async Task<(List<User> Users, int TotalCount)> Search(
            string? keyword,
            int page,
            int pageSize)
        {
            return await _userRepository.SearchAsync(
                keyword,
                page,
                pageSize);
        }
    }
}