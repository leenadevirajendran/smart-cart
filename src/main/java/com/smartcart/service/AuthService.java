package com.smartcart.service;

import com.smartcart.config.JwtUtil;
import com.smartcart.model.User;
import com.smartcart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public String register(String name, String email, String password, User.Role role){
        //Check if email already exists
        if (userRepository.existsByEmail(email)){
            throw new RuntimeException("Email already Registered..!!");
        }

        //Build the user object
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        //Never store password as plaintext- ALWAYS HASH IT
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        //Save to database
        userRepository.save(user);

        //Return a JWT token immediately after registration
        return jwtUtil.generateToken(email, role.name());
    }

    public String login(String email, String password){
        User user=userRepository.findByEmail(email) .orElseThrow(()->new RuntimeException("User not found..!!"));
    if (!passwordEncoder.matches(password, user.getPassword())){
        throw new RuntimeException("Invalid password");
    }
    return jwtUtil.generateToken(email,user.getRole().name());
    }
}
