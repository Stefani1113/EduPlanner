package com.eduplanner.ed_ms_administracion.service;

import org.springframework.stereotype.Service;

import com.eduplanner.ed_ms_administracion.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class RegisterService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    

}
