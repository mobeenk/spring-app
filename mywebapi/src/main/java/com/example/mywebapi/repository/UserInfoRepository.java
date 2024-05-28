package com.example.mywebapi.repository;

import com.example.mywebapi.entity.UserInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Integer> {
    Optional<UserInfo> findByName(String username);
    void deleteByName(String username);
    UserInfo save(UserInfo userInfo);
}
