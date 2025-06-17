rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Check if user is member of organization
    function isOrgMember(orgId) {
      return isAuthenticated() && 
        exists(/databases/$(database)/documents/organizationMembers/$(request.auth.uid + '_' + orgId));
    }
    
    // Get user's role in organization
    function getOrgRole(orgId) {
      return get(/databases/$(database)/documents/organizationMembers/$(request.auth.uid + '_' + orgId)).data.role;
    }
    
    // Check if user has specific role or higher
    function hasOrgRole(orgId, role) {
      let userRole = getOrgRole(orgId);
      return userRole == 'owner' || 
             (role == 'admin' && (userRole == 'admin')) ||
             (role == 'member' && (userRole == 'admin' || userRole == 'member')) ||
             (role == 'viewer' && true); // everyone has at least viewer
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if false; // Users cannot delete their account via client
    }
    
    // Organizations collection
    match /organizations/{orgId} {
      allow read: if isOrgMember(orgId);
      allow create: if isAuthenticated();
      allow update: if isOrgMember(orgId) && hasOrgRole(orgId, 'admin');
      allow delete: if isOrgMember(orgId) && getOrgRole(orgId) == 'owner';
    }
    
    // Organization Members collection
    match /organizationMembers/{memberId} {
      allow read: if isAuthenticated() && 
        (isOrgMember(resource.data.orgId) || isOwner(resource.data.userId));
      allow create: if isAuthenticated() && 
        (hasOrgRole(request.resource.data.orgId, 'admin') || 
         request.resource.data.userId == request.auth.uid); // Self-join via invitation
      allow update: if isAuthenticated() && 
        hasOrgRole(resource.data.orgId, 'admin') && 
        resource.data.userId != request.auth.uid; // Cannot change own role
      allow delete: if isAuthenticated() && 
        (hasOrgRole(resource.data.orgId, 'admin') || 
         resource.data.userId == request.auth.uid); // Can leave org
    }
    
    // Invitations collection
    match /invitations/{inviteId} {
      allow read: if isAuthenticated() && 
        (resource.data.email == request.auth.token.email || 
         isOrgMember(resource.data.orgId));
      allow create: if isAuthenticated() && 
        hasOrgRole(request.resource.data.orgId, 'admin');
      allow update: if isAuthenticated() && 
        (resource.data.email == request.auth.token.email || // Invitee can accept
         hasOrgRole(resource.data.orgId, 'admin')); // Admin can cancel
      allow delete: if isAuthenticated() && 
        hasOrgRole(resource.data.orgId, 'admin');
    }
    
    // Case Studies collection
    match /caseStudies/{docId} {
      // Read access
      allow read: if 
        // Public published case studies
        (resource.data.status == 'published') ||
        // Private access for org members
        (resource.data.orgId != null && isOrgMember(resource.data.orgId)) ||
        // Personal case studies
        (resource.data.orgId == null && isOwner(resource.data.userId));
      
      // Create access
      allow create: if isAuthenticated() && 
        // Creating for organization
        ((request.resource.data.orgId != null && 
          isOrgMember(request.resource.data.orgId) && 
          hasOrgRole(request.resource.data.orgId, 'member')) ||
         // Creating personal
         (request.resource.data.orgId == null && 
          request.resource.data.userId == request.auth.uid));
      
      // Update access
      allow update: if isAuthenticated() && 
        // Organization case study
        ((resource.data.orgId != null && 
          isOrgMember(resource.data.orgId) && 
          (hasOrgRole(resource.data.orgId, 'admin') || 
           (hasOrgRole(resource.data.orgId, 'member') && 
            resource.data.createdBy == request.auth.uid))) ||
         // Personal case study
         (resource.data.orgId == null && 
          isOwner(resource.data.userId)));
      
      // Delete access
      allow delete: if isAuthenticated() && 
        // Organization case study
        ((resource.data.orgId != null && 
          isOrgMember(resource.data.orgId) && 
          (hasOrgRole(resource.data.orgId, 'admin') || 
           (hasOrgRole(resource.data.orgId, 'member') && 
            resource.data.createdBy == request.auth.uid))) ||
         // Personal case study
         (resource.data.orgId == null && 
          isOwner(resource.data.userId)));
    }
    
    // Organization Events (Audit Log)
    match /organizationEvents/{eventId} {
      allow read: if isAuthenticated() && 
        isOrgMember(resource.data.orgId) && 
        hasOrgRole(resource.data.orgId, 'admin');
      allow create: if isAuthenticated() && 
        isOrgMember(request.resource.data.orgId);
      allow update: if false; // Events are immutable
      allow delete: if false; // Events cannot be deleted
    }
    
    // Templates collection (future)
    match /templates/{templateId} {
      allow read: if isAuthenticated();
      allow write: if false; // Only admins via admin SDK
    }
  }
}