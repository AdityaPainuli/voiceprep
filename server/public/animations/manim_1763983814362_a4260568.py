from manim import *

class PPOVisualization(Scene):
    def construct(self):
        # Title
        title = Text("PPO Algorithm Overview").to_edge(UP)
        self.play(Write(title))
        
        # Environment and Agent
        env = Circle().shift(LEFT*3)
        agent = Square().shift(RIGHT*3)
        env_label = Text("Environment").next_to(env, DOWN)
        agent_label = Text("Agent").next_to(agent, DOWN)
        self.play(Create(env), Create(agent), Write(env_label), Write(agent_label))
        
        # Interaction arrow
        interaction_arrow = Arrow(agent.get_left(), env.get_right())
        reward_arrow = Arrow(env.get_right(), agent.get_left())
        interaction_text = Text("Action").next_to(interaction_arrow, UP)
        reward_text = Text("Reward").next_to(reward_arrow, DOWN)
        self.play(Create(interaction_arrow), Write(interaction_text))
        self.play(Create(reward_arrow), Write(reward_text))
        
        # Policy Optimization
        policy_box = Rectangle(width=3, height=2).shift(DOWN*2)
        policy_text = Text("Policy Optimization").move_to(policy_box.get_center())
        self.play(Create(policy_box), Write(policy_text))
        
        # Clipping
        clip_text = Text("Clipping").next_to(policy_box, RIGHT)
        self.play(Write(clip_text))
        
        # Update loop
        update_arrow = CurvedArrow(policy_box.get_top(), agent.get_bottom(), angle=-PI/2)
        update_text = Text("Update Policy").next_to(update_arrow, LEFT)
        self.play(Create(update_arrow), Write(update_text))
        
        # Wait before ending
        self.wait(2)