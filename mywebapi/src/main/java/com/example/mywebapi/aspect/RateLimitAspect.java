package com.example.mywebapi.aspect;

import com.example.mywebapi.config.RateLimitConfig;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
public class RateLimitAspect {
    @Autowired
    private RateLimitConfig rateLimitConfig;

    @Autowired
    private RateLimiter rateLimiter;

    @Around("@annotation(RateLimited)")
    public Object enforceRateLimit(ProceedingJoinPoint joinPoint) throws Throwable {
        String key = getKey(joinPoint);
        if (!rateLimiter.tryAcquire(key, rateLimitConfig.getRequests(), rateLimitConfig.getSeconds()))
        {

            throw new RateLimitExceededException("Rate Limit Exceeded for registered IP Addreass: "+key);
        }
        return joinPoint.proceed();
    }

    private String getKey(ProceedingJoinPoint joinPoint) {
        // Extract method signature
        MethodSignature methodSignature = (MethodSignature) joinPoint.getSignature();
        String methodName = methodSignature.getName();

        // Extract user information (optional)
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        String username = (authentication != null) ? authentication.getName() : "anonymous";

        // Extract IP address (optional)
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        String ipAddress = request.getRemoteAddr();


        // Combine them into a unique key
        return methodName  + ":" + ipAddress;
    }

    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public class RateLimitExceededException extends Throwable  {
        public RateLimitExceededException(String message) {
            super(message);
        }

//        @Override
//        public String getMessage() {
//            return super.getMessage();
//        }
    }



}