# ADR-004: Authentication Strategy for APIs and Server-Sent Events

## Question

How should authentication be implemented for the application while supporting both standard API requests and Server-Sent
Events (SSE) without introducing unnecessary complexity?

## Context

The application architecture consists of:

* A React single-page application (SPA)
* An Express backend API
* Background workers and job queues
* SSE endpoints used to communicate job progress and status updates

The authentication mechanism should satisfy the following requirements:

* Secure browser authentication
* Support long-lived user sessions
* Integrate naturally with SSE connections
* Minimize implementation complexity
* Avoid exposing credentials in URLs
* Preserve the native behavior of EventSource, including automatic reconnection

A challenge arises because the native `EventSource` API does not support custom HTTP headers, preventing the use of
`Authorization: Bearer <token>` during SSE connection establishment.

## Options Considered

### Option 1: JWT Authentication Using HttpOnly Cookies

Store the authentication JWT inside an HttpOnly cookie and allow both API requests and SSE connections to authenticate
using browser-managed cookies.

```text
Browser
↓
HttpOnly JWT Cookie
↓
Express Authentication Middleware
↓
APIs and EventSource
```

Pros:

* Single authentication mechanism for browser clients
* Native EventSource reconnect support
* Native Last-Event-ID support
* No credentials exposed through query parameters
* JWT remains inaccessible to JavaScript
* Minimal frontend complexity
* No SSE-specific authentication infrastructure required

Cons:

* Browser-focused approach
* May require a separate authentication strategy if mobile or third-party clients are introduced in the future
* Requires CSRF protection for state-changing operations

### Option 2: JWT Access Token + Refresh Token + SSE Token

Use a short-lived JWT access token for API requests, a refresh token stored as an HttpOnly cookie, and a dedicated SSE
token for EventSource connections.

Pros:

* Unified authentication model across multiple client types
* Suitable for mobile and third-party integrations
* Preserves native EventSource behavior

Cons:

* Increased authentication complexity
* Requires additional endpoints and token management
* Requires authentication-aware reconnect logic
* Introduces SSE-specific infrastructure

### Option 3: JWT Access Token + Fetch Streaming

Replace EventSource with Fetch streams and implement SSE parsing and reconnection manually.

Pros:

* Authorization headers can be used consistently
* Uniform client behavior across platforms

Cons:

* Requires custom SSE parsing logic
* Requires custom reconnection logic
* Requires manual Last-Event-ID handling
* Significantly increases frontend complexity

## Decision

Use JWT authentication through HttpOnly cookies for browser clients.

The JWT cookie will serve as the authentication mechanism for both API requests and SSE connections.

```text
User Login
↓
Express Issues JWT Cookie
(HttpOnly, Secure, SameSite)

↓

React Application
├── API Requests
│   ↓
│ Cookies Automatically Sent
│
└── EventSource Connections
    ↓
    Cookies Automatically Sent
```

No separate SSE token mechanism will be implemented.

## Consequences

### Positive

* Provides a simple and consistent authentication mechanism for browser clients.
* Allows EventSource to function using its native behavior:

    * Automatic reconnection
    * Native event parsing
    * Native Last-Event-ID support
* Eliminates the need for SSE-specific authentication infrastructure.
* Prevents authentication tokens from being exposed through query parameters.
* Keeps authentication credentials inaccessible to JavaScript through the use of HttpOnly cookies.
* Reduces frontend implementation complexity.

### Negative

* Authentication is optimized primarily for browser environments.
* Supporting future mobile applications or third-party integrations may require introducing an additional authentication
  mechanism.
* State-changing requests must be protected against Cross-Site Request Forgery (CSRF).

## SSE Recovery Strategy

The application will rely on EventSource's native reconnection behavior.

```text
Connection Lost
↓
Browser Reconnects Automatically
↓
JWT Cookie Automatically Included
↓
Server Authenticates Request
↓
Event Stream Resumes
```

For job progress updates, the server will expose the current state of the job when a client reconnects.

```text
Reconnect
↓
Send Current Job Snapshot
↓
Resume Live Updates
```

The system will prioritize delivering the latest job state rather than implementing full event replay.

## Rationale

The application is currently designed as a browser-based system where the frontend and backend are controlled by the
same team.

Using JWT authentication through HttpOnly cookies provides the simplest architecture while maintaining strong security
characteristics and preserving the advantages of native EventSource.

Although a JWT-based API architecture with dedicated SSE tokens offers greater flexibility for multiple client types,
that flexibility introduces additional complexity that is not currently justified by the project's requirements.

The chosen approach optimizes for maintainability, developer experience, and operational simplicity while preserving a
migration path should additional client platforms become necessary in the future.
