# Cloudflare DNS Backup for tanzitech.com

## Current DNS Records (Working Configuration)

### A Records (GitHub Pages)
```
Type: A
Name: tanzitech.com (or @)
Content: 185.199.108.153
Proxy: DNS only (gray cloud)
TTL: Auto

Type: A  
Name: tanzitech.com (or @)
Content: 185.199.109.153
Proxy: DNS only (gray cloud)
TTL: Auto

Type: A
Name: tanzitech.com (or @)
Content: 185.199.110.153  
Proxy: DNS only (gray cloud)
TTL: Auto

Type: A
Name: tanzitech.com (or @)
Content: 185.199.111.153
Proxy: DNS only (gray cloud)
TTL: Auto
```

### CNAME Records
```
Type: CNAME
Name: blog
Content: tanzitech.com
Proxy: DNS only (gray cloud)
TTL: Auto

Type: CNAME
Name: www
Content: tanzitech.com  
Proxy: DNS only (gray cloud)
TTL: Auto
```

### MX Records (Email - Optional)
```
Type: MX
Name: tanzitech.com (or @)
Content: tanzitech.com
Priority: 10
TTL: Auto
```

### TXT Records (Email Security - Optional)
```
Type: TXT
Name: tanzitech.com (or @)
Content: v=spf1 include:_spf.google.com ~all
TTL: Auto

Type: TXT  
Name: _dmarc
Content: v=DMARC1; p=quarantine; rua=mailto:info@tanzitech.com
TTL: Auto
```

## Nameservers
```
dimitris.ns.cloudflare.com
uma.ns.cloudflare.com
```

## Notes
- All records should be set to "DNS only" (gray cloud) for GitHub Pages
- This configuration works with both tanzitech.com and GitHub Pages
- Created: 2025-08-27
- Status: Working configuration
