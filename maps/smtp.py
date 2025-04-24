import smtplib

def prompt(title):
    return input(title).strip()

# from_addr = prompt("From: ")
# to_addrs  = prompt("To: ").split()
# print("Enter message, end with ^D (Unix) or ^Z (Windows):")

# Add the From: and To: headers at the start!
from_addr = "g@g.com"
to_addrs = ('isoughtajam@gmail.com', )
lines = [f"From: {from_addr}", f"To: {', '.join(to_addrs)}", ""]
lines = [f"From: g@g.com", f"To: isoughtajam@gmail.com", ""]
lines.append("hello.")
msg = "\r\n".join(lines)
print("Message length is", len(msg))

server = smtplib.SMTP(host="localhost", port=8025)
server.set_debuglevel(1)
server.sendmail(from_addr, to_addrs, msg)
server.quit()
