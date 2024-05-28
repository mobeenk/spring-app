package com.example.mywebapi.service;

import com.example.mywebapi.entity.UserInfo;
import com.example.mywebapi.repository.UserInfoRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserInfoService implements UserDetailsService {

    @Autowired
    private UserInfoRepository _userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<UserInfo> userDetail = _userRepository.findByName(username);

        // Converting userDetail to UserDetails
        return userDetail.map(UserInfoDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }


    public boolean userExists(String username) {
        return _userRepository.findByName(username).isPresent();
    }
    public String addUser(UserInfo userInfo) {
        userInfo.setPassword(encoder.encode(userInfo.getPassword()));
        _userRepository.save(userInfo);
        return "User Added Successfully";
    }
    @Transactional
    public void deleteUserByName(String username) {
        if (username.equalsIgnoreCase("admin")) {
            throw new IllegalArgumentException("Cannot delete user with username 'admin'");
        }
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        if (userOpt.isPresent()) {
            _userRepository.deleteByName(username);
        } else {
            throw new EntityNotFoundException("User not found with username: " + username);
        }
    }

    public void lockUser(String username) {
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        userOpt.ifPresent(user -> {
            user.setLocked(true);
            _userRepository.save(user);
        });
    }

    public void unlockUser(String username) {
        Optional<UserInfo> userOpt = _userRepository.findByName(username);
        userOpt.ifPresent(user -> {
            user.setLocked(false);
            _userRepository.save(user);
        });
    }
//    @Transactional
//    public void deleteUserByName(String username) {
//        _userRepository.deleteByName(username);
//    }
}
